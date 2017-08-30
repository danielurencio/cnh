import cx_Oracle
from sqlalchemy import create_engine
import pandas as pd
import numpy as np
import re

conn = "oracle://cmde_valid:valid17@172.16.120.3:1521/cnih"
query = "SELECT FECHA,BRENT FROM PRECIOS"
engine = create_engine(conn)

conn_local = 'oracle://cmde_raw:raw17@localhost:1521/XE'
query_ofertas = "SELECT ID_BLOQUE,VAR_ADJ2 FROM DATOS_LICITACIONES_OFERTAS WHERE ID_LICITANTE_OFERTA = ID_LICITANTE_ADJ"
query_bloques = "SELECT ID_BLOQUE,RONDA,LICITACION,NOMBRE_BLOQUE,NUM_BLOQUE FROM DATOS_LICITACIONES_BLOQUES" 

engine_local = create_engine(conn_local)

ofertas_local = pd.read_sql(query_ofertas,engine_local)
ofertas_local.columns = ofertas_local.columns.map(lambda x: x.upper())
ofertas_local.set_index('ID_BLOQUE',inplace=True)

bloques_local = pd.read_sql(query_bloques,engine_local)
bloques_local.columns = bloques_local.columns.map(lambda x: x.upper())
bloques_local.set_index('ID_BLOQUE',inplace=True)

brent = pd.read_sql(query,engine)
firmas = pd.read_csv("fechas.csv")
PMT = pd.ExcelFile("PMT.xlsx")
pmt = PMT.parse('PMT')
pozo_ut = PMT.parse('POZO_UT')
sanciones = PMT.parse('Sanciones')

pmt

def formatFecha(x):
    fecha = x.split("-")
    dia = fecha[0]
    mes = fecha[1]
    ano = fecha[2]
    if(len(str(dia)) == 1 ):
      dia = "0" + str(dia)
    f_ = str(dia) + "-" + str(mes) + "-" + str(ano)
    return f_

firmas.fecha = firmas.fecha.map(formatFecha)

firmas.fecha = pd.to_datetime(firmas.fecha,format="%d-%m-%Y")
firmas.set_index("fecha",inplace=True)
brent.fecha = pd.to_datetime(brent.fecha)
brent.set_index("fecha",inplace=True)

fechas = firmas.join(brent)
fechas["ronda"] = np.zeros(fechas.shape[0])
fechas["licitacion"] = np.zeros(fechas.shape[0])
fechas["bloque"] = np.zeros(fechas.shape[0])

fechas.ronda = fechas.area.map(lambda x: x.split("-")[1])
fechas.licitacion = fechas.area.map(lambda x: x.split("-")[2])

def getBLoque(x):
  arr = x.split("/")[0].split("-")
  arr = arr[len(arr)-1]
  if("CPP" in arr):
    arr = "PERDIDO " + arr[1]
  elif("CS" in arr):
    arr = "HAN " + arr[1]
  elif(not "TRION" in arr):
#     arr = arr[1:]
    arr = re.sub("^0","",arr)[1:]
  return arr


fechas["bloque"] = fechas.area.map(getBLoque)

def formatoRonda(x):
  ronda = x
  if(x == "A1"):
    ronda = "ASOCIACION"
  if(not "M" in str(x) and x != "A1" and x != "ASOCACION"):
    ronda = str(int(re.sub("R","",x)))
  if(x == "Asoc-Trion"):
    ronda = "ASOCIACION"
  ronda = str(ronda)
  return ronda


def formatoLic(x):
  licitacion = x
  if("L" in licitacion  and licitacion != "TRION" and licitacion != "Ek"):
    licitacion = str(int(re.sub("L","",licitacion)))
  if("/2016" in licitacion):
    licitacion = re.sub("/2016","",licitacion)
  licitacion = str(licitacion)
  return licitacion

fechas.ronda = fechas.ronda.map(formatoRonda)
fechas.licitacion = fechas.licitacion.map(formatoLic)

fechas['ID_BLOQUE'] = np.zeros(fechas.shape[0])
pmt['ID_BLOQUE'] = np.zeros(pmt.shape[0])
pozo_ut['ID_BLOQUE'] = np.zeros(pozo_ut.shape[0])
sanciones['ID_BLOQUE'] = np.zeros(sanciones.shape[0])

fechas.columns = fechas.columns.map(lambda x:str(x).upper())

def ID_BLOQUE(x):
  id_ = x
  if(str(x.RONDA) != "ASOCIACION"):
    id_ = "R" + str(x.RONDA)  + "L" + str(x.LICITACION) + "-" + str(x.BLOQUE)
  else:
    id_ = "ASOCIACION-" + str(x.BLOQUE)
  return id_


fechas.ID_BLOQUE = fechas.apply(ID_BLOQUE,axis=1)
pmt.ID_BLOQUE = pmt.apply(ID_BLOQUE,axis=1)
pozo_ut.ID_BLOQUE = pozo_ut.apply(ID_BLOQUE,axis=1)
sanciones.ID_BLOQUE = sanciones.apply(ID_BLOQUE,axis=1)

fechas.reset_index(inplace=True)

fechas.set_index("ID_BLOQUE",inplace=True)
pmt.set_index("ID_BLOQUE",inplace=True)

pozo_ut.set_index("ID_BLOQUE",inplace=True)
sanciones.set_index("ID_BLOQUE",inplace=True)

pmt = pmt.join(fechas[["fecha","BRENT"]])
pmt = pmt.join(pozo_ut["POZO_UT"])

pmt.loc[pmt[(pmt.RONDA == 2)].index,"BRENT"] = 52.57

pmt["USD_SANCION_UT"] = np.zeros(pmt.shape[0])

for i in pmt[~pmt["BRENT"].isnull()].index:
  precio = pmt.ix[i,"BRENT"]
  rangos = sanciones.ix[i,['MIN_BRENT','MAX_BRENT','USD_SANCION_UT']]
  cond = (rangos['MIN_BRENT']<precio) & (rangos['MAX_BRENT']>=precio)
  usd_sancion_ut = rangos[cond]['USD_SANCION_UT'][0]
  pmt.ix[i,'USD_SANCION_UT'] = usd_sancion_ut

########33 OJO: REMOVIENDO DUPLICADOS #####################
pmt.drop_duplicates(inplace=True)
##########################################################
pmt.USD_SANCION_UT = pmt.USD_SANCION_UT.map(lambda x: np.NaN if x==0 else x)

pmtAdj = pmt[~pmt["BRENT"].isnull()]

#ofertas_local["ID_BLOQUE_"] = np.zeros(ofertas_local.shape[0])

###########################REHACER IDS PARA PDER HACER MATCH CON PMT########
def ID_BLOQUE__(x):
  id_ = x
  if(str(x.RONDA) != "ASOCIACION"):
    id_ = "R" + str(x.RONDA)  + "L" + str(x.LICITACION) + "-" + str(x.NUM_BLOQUE)
  else:
    id_ = "ASOCIACION-" + str(x.BLOQUE)
  return id_

def ID_BLOQUE_(x):
    s_ = x.NOMBRE_BLOQUE.split(" ")
    num = None
    if(len(s_) == 2):
      num = s_[1]
    return num

sinNum = bloques_local[bloques_local['NUM_BLOQUE'].isnull()].index

numArea = bloques_local[~bloques_local['NUM_BLOQUE'].isnull()]
numArea = numArea[numArea['NUM_BLOQUE'].str.contains("REA")].index

bloques_local.ix[numArea,"NUM_BLOQUE"]=bloques_local.loc[numArea]['NUM_BLOQUE'].map(lambda x: x.split(" ")[1])
bloques_local.loc[sinNum,"NUM_BLOQUE"] = bloques_local.apply(ID_BLOQUE_,axis=1)

conNum = bloques_local[~bloques_local['NUM_BLOQUE'].isnull()]

conNum["ID_BLOQUE_"] = np.zeros(conNum.shape[0])
conNum.ix[conNum.index,"ID_BLOQUE_"] = conNum.apply(ID_BLOQUE__,axis=1)

#########################3 join con var adj """
ofertas_local = ofertas_local.join(conNum)
ofertas_local.reset_index(inplace=True)
ofertas_local.set_index("ID_BLOQUE_",inplace=True)

##### HAY QUE VER CUÁLES Y POR QUÉ SE ESTÁN DUCPLICANDO ####
#pmt.join(ofertas_local['VAR_ADJ2'])

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
query_bloques = "SELECT ID_BLOQUE1,RONDA,LICITACION,NOMBRE_BLOQUE,NUM_BLOQUE FROM DATOS_LICITACIONES_BLOQUES1" 

engine_local = create_engine(conn_local)

ofertas_local = pd.read_sql(query_ofertas,engine_local)
ofertas_local.columns = ofertas_local.columns.map(lambda x: x.upper())
ofertas_local.set_index('ID_BLOQUE',inplace=True)

#################################OFERTAS RAW##################################3
#ofertas_raw = pd.read_sql('SELECT * FROM DATOS_LICITACIONES_OFERTAS',create_engine('oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'))
ofertas_raw = pd.read_csv('../nt_ofertas.csv')
ofertas_raw.columns = ofertas_raw.columns.map(lambda x:x.upper())
ofertas_raw['ID_BLOQUE_'] = np.zeros(ofertas_raw.shape[0])
ofertas_raw['ID_BLOQUE_'] = ofertas_raw['ID_BLOQUE_'].map(lambda x: np.NaN)
ofertas_raw['ID_BLOQUE_'] = ofertas_raw.apply(lambda x:'R' + str(x.RONDA) + 'L' + str(x.LICITACION) + '-' + str(x.NUM_BLOQUE),axis=1)
ofertas_raw.set_index('ID_BLOQUE_',inplace=True)
#########################TODOS############################################33
todos = ofertas_local.index.tolist()
todos = pd.DataFrame({'ID_BLOQUE':todos})

###########################################################################


bloques_local = pd.read_sql(query_bloques,engine_local)
#bloques_local = pd.read_csv("../DATOS_LICITACIONES_bloques_nuevo.csv")
bloques_local.rename(columns={ 'index':'ID_BLOQUE', 'NUM':'NUM_BLOQUE','AREA':'NOMBRE_BLOQUE','LIC':'LICITACION' },inplace=True)
bloques_local.columns = bloques_local.columns.map(lambda x: x.upper())
bloques_local.set_index('ID_BLOQUE1',inplace=True)
bloques_local.ix[bloques_local[bloques_local['RONDA'].str.contains('ASOC')].index,"RONDA"] = "ASOC"

brent = pd.read_sql(query,engine)
firmas = pd.read_csv("fechas.csv")
PMT = pd.ExcelFile("PMT.xlsx")
pmt = PMT.parse('PMT')
pozo_ut = PMT.parse('POZO_UT')
sanciones = PMT.parse('Sanciones')



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
    arr = arr[1]
  elif("CS" in arr):
    arr = int(arr[1]) + 4
  elif(not "TRION" in arr):
#     arr = arr[1:]
    arr = re.sub("^0","",arr)[1:]
  return str(arr)


fechas["bloque"] = fechas.area.map(getBLoque)
fechas.bloque = fechas.bloque.map(lambda x: re.sub("^0","",x))


def formatoRonda(x):
  ronda = x
  if(x == "A1"):
    ronda = "ASOC"
  if(not "M" in str(x) and x != "A1" and x != "ASOC"):
    ronda = str(int(re.sub("R","",x)))
  if(x == "ASOC-TRION"):
    ronda = "ASOC"
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
  if(str(x.RONDA) != "ASOC"):
    id_ = "R" + str(x.RONDA)  + "L" + str(x.LICITACION) + "-" + str(x.BLOQUE)
  else:
    id_ = "ASOC-" + str(x.BLOQUE)
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
  if(str(x.RONDA) != "ASOC"):
    id_ = "R" + str(x.RONDA)  + "L" + str(x.LICITACION) + "-" + str(x.NUM_BLOQUE)
  else:
    id_ = "ASOC-" + str(x.NUM_BLOQUE)
  return id_

def ID_BLOQUE_(x):
    s_ = x.NOMBRE_BLOQUE.split(" ")
    num = None
    if(len(s_) == 2):
      num = s_[1]
    if(x.RONDA[0] == 'A'):
      num = x.NOMBRE_BLOQUE
    return num

sinNum = bloques_local[bloques_local['NUM_BLOQUE'].isnull()].index

numArea = bloques_local[~bloques_local['NUM_BLOQUE'].isnull()]
numArea = numArea[numArea['NUM_BLOQUE'].str.contains("REA")].index

bloques_local.ix[numArea,"NUM_BLOQUE"]=bloques_local.loc[numArea]['NUM_BLOQUE'].map(lambda x: x.split(" ")[1])
bloques_local.loc[sinNum,"NUM_BLOQUE"] = bloques_local.apply(ID_BLOQUE_,axis=1)

bloquesFix = bloques_local[bloques_local.index.str.contains('HAN')]

bloques_local.ix[bloquesFix.index,"NUM_BLOQUE"] = bloquesFix.apply(lambda x: int(x.NUM_BLOQUE) + 4,axis=1)

conNum = bloques_local[~bloques_local['NUM_BLOQUE'].isnull()]

conNum.loc[conNum.index,"ID_BLOQUE_"] = np.zeros(conNum.shape[0])
#El bloque 12 de la R2.2 se convirtie en la 10
conNum.ix['R2L2-10','NUM_BLOQUE'] = 10
conNum.ix[conNum.index,"ID_BLOQUE_"] = conNum.apply(ID_BLOQUE__,axis=1)



#########################3 join con var adj """
ofertas_local = ofertas_local.join(conNum)
ofertas_local.reset_index(inplace=True)
ofertas_local.set_index("ID_BLOQUE_",inplace=True)


##### HAY QUE VER CUaLES Y POR QUe SE ESTaN DUCPLICANDO ####
new_pmt = pmtAdj.join(ofertas_local[['VAR_ADJ2','ID_BLOQUE']])
new_pmt = new_pmt[~new_pmt['VAR_ADJ2'].isnull()]
#todos[~todos.ID_BLOQUE.isin(new_pmt.ID_BLOQUE)]

new_pmt['INV_COMPROMETIDA'] = np.zeros(new_pmt.shape[0])

################# INV. COMPROMETIDA PARA BLOQUES DE R1.1 - R1.3 #########
PC_adicional = new_pmt[(new_pmt['RONDA'] == 1) & (new_pmt['LICITACION'] != 4)]
calc = lambda x: x.UT + (x.UT*(x.VAR_ADJ2/100))
new_pmt.ix[PC_adicional.index,"INV_COMPROMETIDA"] = PC_adicional.apply(calc,axis=1)

############### INV. COMPROMETIDA A PARTIR DE R1.4 EN ADELANTE #########3
pzo_ad0 = new_pmt[(new_pmt['RONDA'] == 1) & (new_pmt['LICITACION'] == 4)]
pzo_ad1 = new_pmt[(new_pmt['RONDA'] == 2)]
pozos_ = pzo_ad0.index.tolist() + pzo_ad1.index.tolist()

def calc1(x):
  if(x.VAR_ADJ2 == 0):
    mult = 0
  elif(x.VAR_ADJ2 == 1):
    mult = 1
  else:
    mult = 2
  inv = x.UT + (mult*x.POZO_UT)
  return inv

new_pmt.ix[pozos_,'INV_COMPROMETIDA'] = new_pmt.apply(calc1,axis=1)

new_pmt['INV_COMPROMETIDA_USD'] = np.zeros(new_pmt.shape[0])
new_pmt.ix[new_pmt.index,"INV_COMPROMETIDA_USD"] = new_pmt.apply(lambda x:x.USD_SANCION_UT*x.INV_COMPROMETIDA,axis=1)

##############################IDs PARA TABLA DE OFERTAS#######################
new_pmt_id = new_pmt['ID_BLOQUE'].copy()
ofertas_raw = ofertas_raw.join(new_pmt_id)
ofertas_raw.ix["R1L3-1","ID_BLOQUE"] = "R1L3-BARCOD\xc3\x93N"
ofertas_raw.ix["R1L3-12","ID_BLOQUE"] = "R1L3-MARE\xc3\x93GRAFO"
ofertas_raw.ix['R1L3-14',"ID_BLOQUE"] = "R1L3-MOLOAC\xc3\x81N"
ofertas_raw.ix['R1L3-16',"ID_BLOQUE"] = "R1L3-PARA\xc3\x8dSO"
ofertas_raw.ix['R1L3-18','ID_BLOQUE'] = "R1L3-PE\xc3\x91A BLANCA"
ofertas_raw.ix['R1L3-19','ID_BLOQUE'] = "R1L3-PONT\xc3\x93N"
ofertas_raw.ix['R1L3-23','ID_BLOQUE'] = "R1L3-TAJ\xc3\x93N"
ofertas_raw.ix['R1L3-25','ID_BLOQUE'] = "R1L3-TOP\xc3\x89N"
ofertas_raw.ix["R1L2-1","ID_BLOQUE"] = "R1L2-AMOCA-TECOALLI-MIZT\xc3\x93N"
ofertas_raw.ix["R1L2-5","ID_BLOQUE"] = "R1L2-NAK-MIS\xc3\x93N"
ofertas_raw.ix["R1L2-3","ID_BLOQUE"] = "R1L2-XULUM"
ofertas_raw.ix["R1L4-10","ID_BLOQUE"] = "R1L4-HAN6"
ofertas_raw.ix["R1L4-6","ID_BLOQUE"] = "R1L4-HAN2"
ofertas_raw.ix["RPEMEXLTrion-Trion","ID_BLOQUE"] = "ASOC-TRION"
ofertasRawNulls = ofertas_raw[ofertas_raw['ID_BLOQUE'].isnull()].index.drop_duplicates()
ofertas_raw.ix[ofertasRawNulls,"ID_BLOQUE"] = ofertas_raw.ix[ofertasRawNulls].index.map(lambda x:x)
ofertas_raw.to_csv("../nt_ofertas_1.csv",header=False,index=False,encoding="utf-8")
ofertas_raw.to_csv("../nt_ofertas_1_header.csv",header=True,index=False,encoding="UTF-8")

print("ARCHIVO NUEVO DE OFERTAS GENERADO!")

#############################################################################3

new_pmt.set_index("ID_BLOQUE",inplace=True)
new_pmt.index = new_pmt.index.map(lambda x: unicode(x.decode('utf-8')))
new_pmt = new_pmt[['RONDA','LICITACION','UT','POZO_UT','VAR_ADJ2','BRENT','USD_SANCION_UT','INV_COMPROMETIDA','INV_COMPROMETIDA_USD']]


############ GENERAR NUEVA TABLA DE BLOQUES CON LA INV. COMPROMETIDA ###########
#new_pmt.to_csv("inv_comprometida_usd.csv",index=True)
bloques_raw = pd.read_csv("../DATOS_LICITACIONES_bloques_nuevo.csv")
bloques_raw.rename(columns={ 'index':'ID_BLOQUE' },inplace=True)
bloques_raw.set_index("ID_BLOQUE",inplace=True)
bloques_raw.index = bloques_raw.index.map(lambda x: unicode(x.decode('utf-8')))
bloques_raw = bloques_raw.join(new_pmt["INV_COMPROMETIDA_USD"])
bloques_raw.ix[bloques_raw.index,"INV_COMPROMETIDA_USD"] = bloques_raw["INV_COMPROMETIDA_USD"].map(lambda x: np.NaN if x==0 else x)
bloques_raw.ix['ASOC-TRION','INV_COMPROMETIDA_USD'] = 570000000
bloques_raw.to_csv("../DATOS_LICITACIONES_bloques_nuevo_ids.csv",index=True,encoding="utf-8",header=True)
print("ARCHIVO de BLOQUES GENERADO!")


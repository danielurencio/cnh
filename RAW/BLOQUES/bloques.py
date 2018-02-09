import datetime
import numpy as np
import pandas as pd
import re
from sqlalchemy import create_engine
from pymongo import MongoClient


# UNIDADES DE TRABAJO
PMT = pd.ExcelFile("PMT.xlsx")
pmt = PMT.parse("PMT")
pozo_ut = PMT.parse("POZO_UT")
sanciones = PMT.parse("Sanciones")

# POZOS COMPROMETIDOS
pozos_comp = pd.read_csv("https://rondasmexico.gob.mx/wp-content/uploads/2017/12/cr_pozos_b.csv",encoding='latin1',skipfooter=4,engine="python")
pozos_comp = pozos_comp[['Contrato','Pozos comprometidos']]#.dropna()
pozos_comp.set_index('Contrato',inplace=True)

collection = MongoClient("mongodb://localhost:27017").cnh.poligonos_bien
poligonos = []

for i in collection.find({},{ '_id':0, 'lic':0 }):
  poligonos.append(i)

conn_public = 'oracle://cmde_public:public17@172.16.120.3:1521/cnih'
engine_public = create_engine(conn_public)
query_public = "SELECT DISTINCT ID_BLOQUE,INV_USD FROM LICITACIONES_BLOQUES_OFERTAS"

conn_raw = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'
engine_raw = create_engine(conn_raw)
query_raw = "SELECT ID_BLOQUE1, ID_LICITANTE_ADJ, ID_OPERADOR FROM DATOS_LICITACIONES_BLOQUES"


fecha_firma = pd.read_csv('archivos/fechaFirma.csv').set_index('ID_CONTRATO')

tabla = pd.read_sql(query_public,engine_public)
tabla.columns = tabla.columns.str.upper()

bloques_old = pd.read_sql(query_raw,engine_raw)
bloques_old.columns = bloques_old.columns.str.upper()
bloques_old.ID_BLOQUE1 = bloques_old.ID_BLOQUE1.map(lambda x:unicode(x.decode('latin1')))
bloques_old.set_index("ID_BLOQUE1",inplace=True)

bloques = pd.read_csv("archivos/_bloques_.csv",encoding="latin1")
ids_bien = pd.read_csv("archivos/IDS_BLOQUES.csv",encoding="latin1")
ids_bien.OLD_ID = ids_bien.OLD_ID.str.upper()
ids_bien.OLD_ID = ids_bien.OLD_ID.map(lambda x:unicode(x))
ids_bien.set_index("OLD_ID",inplace=True)

ids_adj = ids_bien.join(bloques_old).reset_index()
ids_adj = ids_adj[['NEW_ID','ID_LICITANTE_ADJ','ID_OPERADOR']]
ids_adj.set_index('NEW_ID',inplace=True)


def regexID(x):
  id_ = x
  rules = [
    ['CNH-',''],
    ['R0','R'],
    ['L0','L'],
    ['-L','L'],
    ['/[0-9][0-9][0-9][0-9]','']
  ]
  for r in rules:
    id_ = re.sub(r[0],r[1],id_)
  return id_


bloques.ID_BLOQUE = bloques.ID_BLOQUE.map(regexID)


def regexCols(x):
  col = x
  rules = [
    [' ','_'],
    ['\(|\)',''],
  ]
  for r in rules:
    col = re.sub(r[0],r[1],col)
  return col


bloques.ID_BLOQUE = bloques.ID_BLOQUE.map(lambda x:unicode(x))
tabla.ID_BLOQUE = tabla.ID_BLOQUE.map(lambda x:unicode(x.decode('latin1')))

bloques.set_index("ID_BLOQUE",inplace=True)
tabla.set_index("ID_BLOQUE",inplace=True)

merge = bloques.join(tabla)

cols = ['NOMBRE_BLOQUE','UBICACION','ADJUDICADO','ENTIDAD','ENTIDAD_PRINCIPAL','PROV_GEO','CUENCA','TIPO_ACTIVIDAD','HIDROC_PRINCIPAL','TIPO_HIDROCARBURO','HIDROCARBUROS','LITOLOGIA','PLAYS','CAMPOS']

for i in cols:
  merge[i] = merge[i].str.upper()
  merge[i] = merge[i].map(lambda x:re.sub(",",";",x) if not pd.isnull(x) else x)


merge = merge.join(ids_adj)
merge.drop("POLIGONO",axis=1,inplace=True)
merge.replace(' ',np.nan,regex=False,inplace=True)
merge.replace('"',np.nan,regex=False,inplace=True)


cols_to_fix = ['GRADOS_API','RESV_GAS_1P','COB_SIS_3D','REC_PROSP_P10','SUPERFICIE']

for c in cols_to_fix:
  merge[c] = merge[c].map(lambda x: float(x) if not pd.isnull(x) else x)


merge["POLIGONO"] = pd.Series([np.nan for i in xrange(merge.shape[0])],index=merge.index)

for i,d in merge.iterrows():
  for b in poligonos:
    if i == b["ID_BLOQUE"]:
      merge.loc[i,"POLIGONO"] = str(b)


CONTRATOS = merge.reset_index()[['ID_BLOQUE','ID_CONTRATO']].dropna().copy().set_index('ID_CONTRATO')
CONTRATOS = CONTRATOS.join(pozos_comp)
CONTRATOS = CONTRATOS.join(fecha_firma)
CONTRATOS.loc['CNH-R02-L03-VC-03/2017','Pozos comprometidos'] = 2
CONTRATOS.reset_index(inplace=True)
CONTRATOS.set_index("ID_BLOQUE",inplace=True)
CONTRATOS.rename(columns={ 'Pozos comprometidos':'POZOS_COMPROMETIDOS', 'index':'ID_CONTRATO' }, inplace=True)

merge.drop("POZOS_COMPROMETIDOS",inplace=True,axis=1)
merge = merge.join(CONTRATOS.drop('ID_CONTRATO',axis=1))
merge.POZOS_COMPROMETIDOS = merge.POZOS_COMPROMETIDOS.map(lambda x:int(x) if not pd.isnull(x) else x)
merge.FECHA_FIRMA = pd.to_datetime(merge.FECHA_FIRMA,format='%d/%m/%Y')

IDS_LICITANTE_ADJ_MISSING = [['R1L2-1',27],['R1L3-1',24],['R1L3-12',17],['R1L3-14',7],['R1L3-16',78],['R1L3-18',89],['R1L3-19',74],['R1L3-23',16],['R1L3-25',74]]

for i in IDS_LICITANTE_ADJ_MISSING:
  merge.loc[i[0],'ID_LICITANTE_ADJ'] = i[1]

#merge.to_sql('datos_licitaciones_bloques',engine_raw,if_exists='append')
print("Todo bien.")

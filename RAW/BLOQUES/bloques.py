import numpy as np
import pandas as pd
import re
from sqlalchemy import create_engine

conn_public = 'oracle://cmde_public:public17@172.16.120.3:1521/cnih'
engine_public = create_engine(conn_public)
query_public = "SELECT DISTINCT ID_BLOQUE,INV_USD FROM LICITACIONES_BLOQUES_OFERTAS"

conn_raw = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'
engine_raw = create_engine(conn_raw)
query_raw = "SELECT ID_BLOQUE1, ID_LICITANTE_ADJ, ID_OPERADOR FROM DATOS_LICITACIONES_BLOQUES"


tabla = pd.read_sql(query_public,engine_public)
tabla.columns = tabla.columns.str.upper()

bloques_old = pd.read_sql(query_raw,engine_raw)
bloques_old.columns = bloques_old.columns.str.upper()
bloques_old.ID_BLOQUE1 = bloques_old.ID_BLOQUE1.map(lambda x:unicode(x.decode('utf-8')))
bloques_old.set_index("ID_BLOQUE1",inplace=True)

bloques = pd.read_csv("archivos/_bloques_.csv",encoding="utf-8")
ids_bien = pd.read_csv("archivos/IDS_BLOQUES.csv",encoding="utf-8")
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
tabla.ID_BLOQUE = tabla.ID_BLOQUE.map(lambda x:unicode(x.decode('utf-8')))

bloques.set_index("ID_BLOQUE",inplace=True)
tabla.set_index("ID_BLOQUE",inplace=True)

merge = bloques.join(tabla)

cols = ['NOMBRE_BLOQUE','UBICACION','ADJUDICADO','ENTIDAD','ENTIDAD_PRINCIPAL','PROV_GEO','CUENCA','TIPO_ACTIVIDAD','HIDROC_PRINCIPAL','TIPO_HIDROCARBURO','HIDROCARBUROS','LITOLOGIA','PLAYS','CAMPOS']

for i in cols:
  merge[i] = merge[i].str.upper()
  merge[i] = merge[i].map(lambda x:re.sub(",",";",x) if not pd.isnull(x) else x)


merge = merge.join(ids_adj)
merge.drop("POLIGONO",axis=1,inplace=True)
merge.replace(r'\s+',np.nan,regex=True,inplace=True)
#merge.COB_SIS_3D = pd.to_numeric(merge.COB_SIS_3D)

cols_to_fix = ['GRADOS_API','RESV_GAS_1P','COB_SIS_3D','REC_PROSP_P10','SUPERFICIE']

for c in cols_to_fix:
  merge[c] = merge[c].map(lambda x: float(x) if not pd.isnull(x) else x)

merge.to_csv("BLOQUES_BIEN.csv",encoding="latin1")

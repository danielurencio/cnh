import numpy as np
import pandas as pd
import re
from sqlalchemy import create_engine

conn = 'oracle://cmde_public:public17@172.16.120.3:1521/cnih'
engine = create_engine(conn)
query = "SELECT DISTINCT ID_BLOQUE,INV_USD FROM LICITACIONES_BLOQUES_OFERTAS"

tabla = pd.read_sql(query,engine)
tabla.columns = tabla.columns.str.upper()

bloques = pd.read_csv("_bloques_.csv",encoding="utf-8")

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

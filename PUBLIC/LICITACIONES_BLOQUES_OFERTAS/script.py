# encodint=UTF-8
import sys
reload(sys)
sys.setdefaultencoding("UTF-8")
from sqlalchemy import create_engine
import numpy as np
import pandas as pd
import cx_Oracle
import re


txt_file = open("queryTabla_LICITACIONES_BLOQUES_OFERTAS.txt","r")
query = txt_file.read()
txt_file.close()
query = re.sub('\n',' ',query)
query = re.sub(';','',query)

conn = "oracle://cmde_raw:raw17@172.16.120.3:1521/cnih"
engine = create_engine(conn)

tabla = pd.read_sql(query,engine)
IDS = pd.read_csv("IDS_BLOQUES.csv")

IDS.set_index("OLD_ID",inplace=True)
tabla.set_index("id_bloque",inplace=True)
tabla = tabla.join(IDS)
tabla.reset_index(inplace=True)
tabla.drop("index",axis=1,inplace=True)
tabla.rename(columns={ 'NEW_ID':'ID_BLOQUE' }, inplace=True)
tabla.columns = tabla.columns.str.upper()


# Nuevas entradas (licitaciones desiertas)
entradas = [
  { 'RONDA':u'PEMEX', 'LICITACION':u'Ay\xedn/Batsil', 'ID_BLOQUE':u'ASOC-AY\xcdN/BATSIL' }
]

cache =  { 'RONDA':[], 'LICITACION':[], 'ID_BLOQUE':[] }


for entrada in entradas:
  for k,v in entrada.iteritems():
    cache[k].append(entrada[k])
 

for k,v in cache.iteritems(): cache[k] = np.array(v)

new_entries = { k:np.array([]) for k in list(tabla.columns) }

for k,v in new_entries.iteritems():
  if k in cache:
    new_entries[k] = cache[k]
  else:
    cond = k == 'ID_LICITANTE' or k == 'ID_EMPRESA' or k == 'ID_LICITANTE_ADJ' or k == 'EMPRESA'
    if(cond):
      new_entries[k] = np.zeros_like(len(entradas))
    else:
      new_entries[k] = np.ones_like(len(entradas))


new_tabla = pd.DataFrame(new_entries)
new_tabla.replace(1,np.nan,inplace=True)

tabla = tabla.append(new_tabla)

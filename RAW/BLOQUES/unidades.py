import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from fechas import ids_bloques,fechas


conn = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'
engine = create_engine(conn)
query = 'SELECT * FROM DATOS_LICITACIONES_BLOQUES'

df = pd.read_sql(query,engine)
df.columns = df.columns.str.upper()
df.set_index('ID_BLOQUE',inplace=True)

PMT = pd.ExcelFile("PMT.xlsx")
pmt = PMT.parse("PMT")
pozo_ut = PMT.parse("POZO_UT")


pmt.LICITACION = pmt.LICITACION.map(lambda x:unicode(x).encode('utf-8'))
pmt = ids_bloques(pmt)[['ID_BLOQUE','UT']].set_index('ID_BLOQUE')

pozo_ut.LICITACION = pozo_ut.LICITACION.map(lambda x:unicode(x).encode('utf-8'))
pozo_ut = ids_bloques(pozo_ut)[['ID_BLOQUE','POZO_UT']].set_index('ID_BLOQUE')

df = df.join(pmt).join(pozo_ut)
df.rename(columns={ 'UT':'PMT' }, inplace=True)

df.to_sql('datos_licitaciones_bloques_copia',engine,if_exists='append')
print 'Todo bien.'


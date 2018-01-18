import numpy as np
import pandas as pd
from sqlalchemy import create_engine


conn_raw = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'
engine_raw = create_engine(conn_raw)
query = 'SELECT * FROM DATOS_LICITACIONES_OFERTAS'

ofertas = pd.read_sql(query,engine_raw)
ofertas.columns = ofertas.columns.str.upper()
ofertas.ID_BLOQUE = ofertas.ID_BLOQUE.map(lambda x:unicode(x.decode('latin1')))
ofertas.set_index('ID_BLOQUE',inplace=True)

ids_bien = pd.read_csv('archivos/IDS_BLOQUES.csv',encoding='latin1')
ids_bien.drop("CONTRATO",axis=1,inplace=True)
ids_bien.OLD_ID = ids_bien.OLD_ID.str.upper()
ids_bien.OLD_ID = ids_bien.OLD_ID.map(lambda x:unicode(x))
ids_bien.set_index('OLD_ID',inplace=True)

ofertas_ = ofertas.join(ids_bien)
ofertas_.reset_index(inplace=True)
ofertas_.drop("index",axis=1,inplace=True)
ofertas_.rename(columns={ 'NEW_ID':'ID_BLOQUE'},inplace=True)

#ofertas_.to_sql('datos_licitaciones_ofertas_pruebas',engine_raw,index=False,if_exists='append')

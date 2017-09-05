import pandas as pd
import numpy as np
import cx_Oracle
from sqlalchemy import create_engine

conn = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'

query0 = "select A.ID_EMPRESA, A.PAIS, A.ID_MATRIZ, B.MATRIZ" +\
" from DATOS_LICITACIONES_EMPRESAS A" +\
" LEFT JOIN DATOS_LICITACIONES_MATRICES B" +\
" ON A.ID_MATRIZ = B.ID_MATRIZ"

query1 = 'select * from DATOS_LICITACIONES_MATRICES'

engine = create_engine(conn)

tabla0 = pd.read_sql(query0,engine)
tabla1 = pd.read_sql(query1,engine)

rep = tabla0[['pais','id_matriz','matriz']].drop_duplicates().groupby('id_matriz').count().sort_values(by="pais",ascending=False)
rep0 = rep[rep['pais'] > 1]
rep1 = rep[rep['pais'] == 1]

varios_paises = tabla0[tabla0.id_matriz.isin(rep0.index)].copy()
un_pais = tabla0[tabla0.id_matriz.isin(rep1.index)][['id_matriz','matriz','pais']].drop_duplicates().copy()

un_pais.set_index("id_matriz",inplace=True)
varios_paises.set_index("id_empresa",inplace=True)
varios_paises.drop([119,68,172,98,138,161,5],inplace=True)
varios_paises.set_index("id_matriz",inplace=True)

pd.concat([un_pais,varios_paises]).sort_index().to_csv("nuevos/matrices_paises.csv",encoding="latin1",header=None)

print("CSV generado...")

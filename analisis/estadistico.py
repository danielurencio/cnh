import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import matplotlib.pyplot as plt
import seaborn as sns

conn_valid = 'oracle://cmde_valid:valid17@172.16.120.3:1521/cnih'
conn_raw = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'

engine_valid = create_engine(conn_valid)
engine_raw = create_engine(conn_raw)

queryOfertasBloques = 'select * from licitaciones_bloques_ofertas'

df_ofertas = pd.read_sql(queryOfertasBloques,engine_valid)


# INVERSION POR LICITACION VS BONOS DE 2.4
invXbloque = df_ofertas[['ronda','licitacion','id_bloque','inv_usd']].drop_duplicates().dropna().copy()
invXbloque['ronda_concat'] = invXbloque["ronda"] +  '.' + invXbloque["licitacion"]

invXbloque = invXbloque[['ronda_concat','inv_usd']]
invXbloque = invXbloque.groupby("ronda_concat").sum()
invXbloque.reset_index(inplace=True)

df1 = pd.DataFrame({ "ronda_concat":np.array(["2.4"]),"inv_usd":np.array([525000000]) })
invXbloque = invXbloque.append(df1).sort_values("inv_usd",ascending=True)

barras_inv = sns.barplot(x='ronda_concat',y='inv_usd',data=invXbloque, palette="Greens_d")

for item in barras_inv.get_xticklabels():
  item.set_rotation(45)


# TODOS LOS BONOS QUE SE HAN DADO
bonos = df_ofertas[['id_bloque','licitante','bono']].drop_duplicates().dropna()[['id_bloque','bono']].copy()
bonos.sort_values('bono',ascending=True,inplace=True)

#barras_bonos = sns.barplot(x='id_bloque', y='bono', data=bonos, palette="Greens_d")
barras_bonos = sns.barplot(x='id_bloque',y='bono',data=bonos)


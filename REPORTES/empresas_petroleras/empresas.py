from __future__ import division
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from collections import Counter


#query = 'SELECT DISTINCT ID_LICITANTE,ID_EMPRESA,EMPRESA FROM LICITACIONES_BLOQUES_OFERTAS WHERE ID_LICITANTE != 0 AND ID_LICITANTE_ADJ = ID_LICITANTE'
query = 'SELECT DISTINCT ID_LICITANTE,ID_EMPRESA,EMPRESA FROM LICITACIONES_BLOQUES_OFERTAS WHERE ID_LICITANTE != 0'
query_ofertas = 'SELECT * FROM LICITACIONES_BLOQUES_OFERTAS'

query_matrices = 'SELECT ID_MATRIZ,PAIS FROM DATOS_LICITACIONES_MATRICES'

engine = create_engine('oracle://cmde_valid:valid17@172.16.120.3:1521/cnih')
df = pd.read_sql(query,engine)
df_ofertas = pd.read_sql(query_ofertas,engine)

engine_raw = create_engine('oracle://cmde_raw:raw17@172.16.120.3:1521/cnih')
matrices = pd.read_sql(query_matrices,engine_raw)

lista_empresas = df.id_empresa.unique().tolist()
lista_licitantes = df.id_licitante.unique().tolist()



def grupos(lista,columna):
  obj = {}
  for i in lista:
    obj[str(i)] = df[df[columna] == i].shape[0]
  return obj


pares_empresas = grupos(lista_empresas,'id_empresa').items()
pares_licitantes = grupos(lista_licitantes,'id_licitante').items()


empresas_apareceUno = filter(lambda x:x[1] == 1,pares_empresas)
licitantes_apareceUno = filter(lambda x:x[1] == 1,pares_licitantes)


def empresas_deLicitantesIndividuales():
  data = []
  for i in sorted(map(lambda x:int(x[0]),licitantes_apareceUno)):
    emp = df[df['id_licitante'] == i]['id_empresa'].tolist()[0]
    data.append(emp)
  return sorted(data)


individuales = []
individualesYconsorcio = []

for i in empresas_deLicitantesIndividuales():
  num = df[df['id_empresa'] == i].shape[0]
  if num == 1:
    individuales.append(i)
  else:
    individualesYconsorcio.append(i)


individualesYconsorcio_ = sorted(list(set(individualesYconsorcio)))

solosAlgunaVez = individuales + individualesYconsorcio_

siempreEnConsorcio = []

for i in lista_empresas:
  if i not in solosAlgunaVez:
    siempreEnConsorcio.append(i)


siempreEnConsorcio.sort()


def bloquesXtipo(tipo,ronda=[],soloBloques=False):
  if len(ronda) > 0:
    df = df_ofertas[ (df_ofertas["id_empresa"].isin(tipo)) & (df_ofertas['ronda'] == ronda[0]) & (df_ofertas['licitacion'] == ronda[1]) ]
  else:
    df = df_ofertas[df_ofertas["id_empresa"].isin(tipo)].drop_duplicates()

  df = df[df["id_licitante"] == df["id_licitante_adj"]][['empresa','id_bloque']].drop_duplicates()
  df = df.sort_values('id_bloque').reset_index()[['empresa','id_bloque']]
  if soloBloques:
    df = df['id_bloque'].drop_duplicates().tolist()
  else:
    df = df.groupby("empresa").count()
    df.rename(columns={ 'id_bloque':'bloques_adj' },inplace=True)
  return df



def ofertasXtipo(tipo,ronda=[]):
  if len(ronda) > 0:
    df = df_ofertas[ (df_ofertas["id_empresa"].isin(tipo)) & (df_ofertas['ronda'] == ronda[0]) & (df_ofertas['licitacion'] == ronda[1]) & (df_ofertas["validez"] == 'VALIDA') ]
  else:
    df = df_ofertas[(df_ofertas["id_empresa"].isin(tipo)) & (df_ofertas["validez"] == 'VALIDA')]

  df = df.drop_duplicates()[['empresa','id_bloque']].drop_duplicates()
  df = df.groupby('empresa').count()
  df.rename(columns={ 'id_bloque':'ofertas' },inplace=True)
  return df


def tablaEfectividad(tipo):
  df = ofertasXtipo(tipo).join(bloquesXtipo(tipo)).replace(np.nan,0)
  df["efec"] = (df["bloques_adj"] / df["ofertas"]) * 100
  return df


def Bloques():
  print 1

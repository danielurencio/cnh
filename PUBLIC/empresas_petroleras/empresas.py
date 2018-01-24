import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from collections import Counter


query = 'SELECT DISTINCT ID_LICITANTE,ID_EMPRESA,EMPRESA FROM LICITACIONES_BLOQUES_OFERTAS WHERE ID_LICITANTE != 0 AND ID_LICITANTE_ADJ = ID_LICITANTE'
engine = create_engine('oracle://cmde_valid:valid17@172.16.120.3:1521/cnih')
df = pd.read_sql(query,engine)

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


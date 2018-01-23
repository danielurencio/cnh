import pandas as pd
import numpy as np
import re
import requests
from bs4 import BeautifulSoup
from sqlalchemy import create_engine



conn_raw = 'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'
engine_raw = create_engine(conn_raw)
query_raw = "SELECT ID_CONTRATO FROM DATOS_LICITACIONES_BLOQUES1"

contratos = pd.read_sql(query_raw,engine_raw).dropna()


def change(x):
  result = x.lower().replace("-a","-A").replace("/","-")
  return result


contratos.id_contrato = contratos.id_contrato.map(change)
contratos = list(contratos.id_contrato.values)


def fechas(c):
  data = []
  url = 'https://rondasmexico.gob.mx/'
  for i in c:
    r = requests.get(url + i)
    soup = BeautifulSoup(r.text)
    contents = soup.select('div.timeline-body')
    for j,d in enumerate(contents):
      subconts = d.select('h5')
      for s in subconts:
        if re.match("Firma",s.text):
	  heading = soup.select('div.timeline-heading')
	  fecha = heading[j].select('h5.timeline-title')[0].text
	  print i,fecha
	  data.append([i,fecha])
  return data


def transform(x):
  a = x[0].upper().replace('-2','/2')
  b = x[1].replace(' de ','/')
  months = {
    'enero':'01',
    'febrero':'02',
    'marzo':'03',
    'abril':'04',
    'mayo':'05',
    'junio':'06',
    'julio':'07',
    'agosto':'08',
    'septiembre':'09',
    'octubre':'10',
    'noviembre':'11',
    'diciembre':'12',
  }
  for k,v in months.iteritems():
    b = b.replace(k,v)
  return [a,b]


def fechaFirmas(contratos):
  contratos = fechas(contratos)
  contratos = map(transform,contratos)
  contratos = np.array(contratos)
  df = pd.DataFrame({ 'ID_CONTRATO':contratos[:,0], 'FECHA_FIRMA':contratos[:,1] })
  df.set_index('ID_CONTRATO',inplace=True)
  return df

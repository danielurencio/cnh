import re
import pandas as pd
import numpy as np
import requests
from sqlalchemy import create_engine
from bs4 import BeautifulSoup


url = 'https://rondasmexico.gob.mx'

def obtenerRutas():
  print 'Generando archivo.\n'
  r = requests.get(url)
  soup = BeautifulSoup(r.text,'lxml')
  a = soup.select('div.row a.fusion-no-lightbox')
  hrefs = map(lambda x:x['href'],a)

  lics = []
  links = []
  for i in hrefs:
    r_ = requests.get(url+i)
    soup_ = BeautifulSoup(r_.text,'lxml')
    a_ = soup_.select('div.fusion-main-menu li.menu-item a')
    a_ = filter(lambda x:re.search("href",str(x)),a_)
    matches = map(lambda x: x['href'] if x['href'] else None, a_)
    match = filter(lambda x: x if re.search('seguimiento',x) else None,matches)
    match = match[0] if len(match) > 0 else None
    lics.append(i)
    links.append(match)
    print i,match
  csv = pd.DataFrame({ 'LICITACION':np.array(lics), 'RUTAS':np.array(links) })
  csv.to_csv("rutas.csv",index=False)
  print '\nArchivo generado.'


# p = soup.select('div.accesoCD04 p')


def rutas():
  df = pd.read_csv('rutas.csv')
  df.RUTAS = df.RUTAS.map(lambda x:url + x if not pd.isnull(x) and not re.search('rondasmexico',x) else x)
  df['CASO'] = pd.Series(np.array([ np.nan for i in xrange(df.shape[0]) ]),index=df.index)
  casos_function = {
    'A':[0,1,2,3,4,9,10,11],
    'B':[],
  }
  df.loc[[0,1,2,3,4,9,10,11],'CASO'] = 1
  return df


def A(url,s):
  soup = BeautifulSoup(requests.get(url).text)
  empresas = map(lambda x:x.text,soup.select(s))
  return empresas


def B(url,s,n):
  soup = BeautifulSoup(requests.get(url).text)
  empresas = map(lambda x:x.text,soup.select(s))
  empresas = filter(lambda x: len(str(x)) > n, empresas)
  return empresas



def obtenerEmpresas(url):
  r = requests.get(url)
  soup = BeautifulSoup(r.text,'lxml')
  p = filter(lambda x:len(str(x)) > 1, soup.select('div.accesoCD04 p'))
  empresas = map(lambda x:x.text, p)
  if len(empresas) == 0:
    cds = ['1','3']
    for i in cds:
      empresas = map(lambda x:x.text,soup.select('div.accesoCD0'+ i +' td'))
      if len(empresas) > 0:
	print "o"
	break
  return empresas

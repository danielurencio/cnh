#!/usr/bin/python
# coding: latin-1

import pandas as pd
import numpy as np
import xlwings as xw
import geopandas as gpd
from sqlalchemy import create_engine


class Reporte(object):
    def __init__(self,archivo,hoja):
        self.wb = xw.Book(archivo)
        self.sheet = self.wb.sheets[hoja]
        self.cudaros = self.bloques()

    def datos_grales(self):
#        self.sheet.range("A2").value = u"t\xedtulo".encode("latin1")
        self.bloques()
        self.sheet.range("A126").value = self.cuadros[0]
        self.sheet.range("A159").value = self.cuadros[1]
        self.sheet.range("A201").value = self.cuadros[2]

    def df_RAW(self,query):
        engine = create_engine('oracle://cmde_raw:raw17@172.16.120.3:1521/cnih',encoding='latin1')
        df = pd.read_sql(query,engine)
        return df

    def poligonos(self):
        query = "select poligono from datos_licitaciones_bloques1 where RONDA='2' and LICITACION='4' and poligono is not null"
        df = self.df_RAW(query)
        return df

    def bloques(self):
        query = "SELECT NOMBRE_BLOQUE,PROV_GEO,PLAYS,LITOLOGIA,HIDROC_PRINCIPAL,SUPERFICIE,TIRANTE_PROM,PROB_EXITO_GEO_MAX,PROB_EXITO_GEO_MIN,REC_PROSP_MEDIO,REC_PROSP_TOT_RIESGO FROM DATOS_LICITACIONES_BLOQUES1 WHERE RONDA = '2' AND LICITACION = '4'"
        engine = create_engine('oracle://cmde_raw:raw17@172.16.120.3:1521/cnih',encoding="latin1")
        df = pd.read_sql(query,engine)
        cols = df.columns
        for i in cols:
          df[i] = df[i].map(lambda x:x.decode("latin1") if isinstance(x,str) else x)
        nombres = {'prov_geo':u'Provincia geol\xf3gica','plays':'Edades del Play','litologia':u'Litolog\xeda','hidroc_principal':'Hidrocarburo principal','superficie':'Superficie','tirante_prom':'Tirante de agua','prob_exito_geo_max':u'Probabilidad de \xe9xito geol\xf3gico m\xe1xima','prob_exito_geo_min':u'Probabilidad de \xe9xito geol\xf3gico m\xednimo','rec_prosp_tot_riesgo':'Recurso prospectivo total con riesgo'}
        df.rename(columns=nombres,inplace=True)
        df.set_index('nombre_bloque',inplace=True)
        df.sort_index(inplace=True)
        df = df.T
        unidades = [None, None, None, None, u'km\xb2', 'Metros','Min','Max','MMbpce', 'MMbpce']
        df['Unidades'] = pd.Series(np.array(unidades),index=df.index)
        cols = df.columns.tolist()
        unidades = cols[len(cols)-1]
        cols.remove(unidades)
        cols.insert(0,unidades)
        df = df[cols]
        cuadros = [df[['Unidades']+cols[1:11]],df[['Unidades']+cols[11:21]],df[['Unidades']+cols[21:30]]]
        self.cuadros = cuadros


if __name__ == "__main__":
    reporte = Reporte("plantilla_0.xlsx","A")


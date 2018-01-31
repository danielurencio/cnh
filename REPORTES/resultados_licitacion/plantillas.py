#!/usr/bin/python
# coding: latin-1

from __future__ import division
import re
import pandas as pd
import numpy as np
import xlwings as xw
#import geopandas as gpd
from sqlalchemy import create_engine


class Reporte(object):
    def __init__(self,archivo,hoja,licitacion):
        self.licitacion = licitacion
        self.wb = xw.Book(archivo)
        self.sheet = self.wb.sheets[hoja]
        self.query_bloques = "SELECT NOMBRE_BLOQUE,CONTRATO,PROV_GEO,PLAYS,LITOLOGIA,HIDROC_PRINCIPAL,SUPERFICIE,TIRANTE_PROM,PROB_EXITO_GEO_MAX,PROB_EXITO_GEO_MIN,REC_PROSP_MEDIO,REC_PROSP_TOT_RIESGO FROM DATOS_LICITACIONES_BLOQUES1 WHERE RONDA ='"+str(licitacion[0])+"' AND LICITACION = '"+str(licitacion[1])+"' AND NOMBRE_BLOQUE != 'AP-PY-G01'"
        self.query_valid = "SELECT * FROM LICITACIONES_BLOQUES_OFERTAS WHERE RONDA='"+str(self.licitacion[0])+"' AND LICITACION='"+str(self.licitacion[1])+"'"
        self.engine_raw = create_engine('oracle://cmde_raw:raw17@172.16.120.3:1521/cnih',encoding="latin1")
        self.engine_valid = create_engine('oracle://cmde_valid:valid17@172.16.120.3:1521/cnih')
        self.tabla_bloques = self.limpiarTablaBloques(self.df_RAW(self.query_bloques),True)
        self.tabla_ofertas = self.limpiarTablaBloques(self.df_VALID(self.query_valid))

    def limpiarTablaBloques(self,df,plays_litos=False):
#        df = self.df_RAW(self.query_bloques)
        cols = df.columns
        for i in cols:
          df[i] = df[i].map(lambda x:x.decode("latin1") if isinstance(x,str) else x)
        if(plays_litos):  
          colsToFix = ['plays','litologia']
          for i in colsToFix:
            df[i] = df[i].map(lambda x: re.sub(";",",",x))
            df[i] = df[i].map(lambda x: re.sub("/"," / ",x))
        return df

    def datos_grales(self):
        df = self.tabla_bloques
        # Titulo
        lic = str(self.licitacion[0]) + '.' + str(self.licitacion[1])
        self.sheet.range("A1").value = ("Ronda " + lic).encode("latin1")
        # N. de bloques
        self.sheet.range("I18").value = df.shape[0]
        # Provincias geologicas
        prov_geo = sorted(df.prov_geo.unique().tolist())
        prov_geo = reduce(lambda x,y: x + ', ' + y,prov_geo)
        self.sheet.range("I21").value = prov_geo
        # Edades del Play
        plays = self.Unicos(df.plays.unique().tolist())
        self.sheet.range("I25").value = plays
        # Litologias
        litos = self.Unicos(df.litologia.unique().tolist())
        self.sheet.range("I33").value = litos
        # Hidrocarburo principal
        hidroc = self.Unicos(df.hidroc_principal.unique().tolist())
        self.sheet.range("I41").value = hidroc
        # Tipo de contrato
        contrato = self.Unicos(df.contrato.unique().tolist())
        self.sheet.range("I45").value = contrato.upper()

    def graficos_resumen(self):
        df = self.tabla_ofertas
        # Empresas que adjudicaron
        emps_ = df[df['id_licitante'] == df['id_licitante_adj']]
        emps = emps_['empresa'].shape[0]
        emps_noAdj = df['empresa'].unique().shape[0] - emps
        self.sheet.range("A239").value = ["Adjudicaron","No adjudicaron"]
        self.sheet.range("A240").value = [emps,emps_noAdj]
        # Bloques adjudicados
        bloques_adj = len(df[['id_bloque','id_licitante_adj']].dropna()["id_bloque"].unique().tolist())
        bloques_noAdj = len(df['id_bloque'].unique().tolist()) - bloques_adj
        self.sheet.range("A242").value = ['Adjudicados','No adjudicados']
        self.sheet.range("A243").value = [bloques_adj,bloques_noAdj]
        # Numero de ofertas promedio por bloque
        desiertos = df[pd.isnull(df['id_licitante_adj'])]['id_bloque'].unique().shape[0]
        desiertos = int(desiertos)
        ofertasXbloque = df[df['validez']=='VALIDA'][['id_bloque','id_licitante']].drop_duplicates().groupby("id_bloque").count().id_licitante.sum()
        bloques_total = int(bloques_adj) + int(bloques_noAdj)
        ofertasXbloque /= bloques_total
        self.sheet.range("F77").value = round(ofertasXbloque,1)
        # Numero de empresas participantes por pais
        paises = df[["pais","empresa"]].drop_duplicates().groupby("pais").count()
        paises = paises.reset_index().values
        self.sheet.range("D239").value = paises
        # Bloques adjudicados por empresa
        bloquesXempresa = emps_[["empresa","id_bloque"]].groupby("empresa").count()
        bloquesXempresa = bloquesXempresa.reset_index().values
        self.sheet.range("I239").value = bloquesXempresa

        
    def Unicos(self,lista):
        arr = map(lambda x:re.sub(' Y ',', ',x).split(", "),lista)
        arr_ = []
        for p in arr:
            for i in p:
                arr_.append(i)
        arr_ = sorted(list(set(arr_)))
        arr_ = reduce(lambda x,y:x + ', ' + y,arr_)
        return arr_


    def tablas(self,celdas):
        self.Cuadros()
        for i,celda in enumerate(celdas):
          self.sheet.range(celda).value = self.cuadros[i]

    def df_RAW(self,query):
        df = pd.read_sql(query,self.engine_raw)
        return df

    def df_VALID(self,query):
        df = pd.read_sql(query,self.engine_valid)
        return df

    def poligonos(self):
        query = "select poligono from datos_licitaciones_bloques1 where RONDA='2' and LICITACION='4' and poligono is not null"
        df = self.df_RAW(query)
        return df

    def Cuadros(self):
#        df = pd.read_sql(self.query_bloques,self.engine_raw)
        df = self.tabla_bloques
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
        cuadros = [df[['Unidades']+cols[1:11]],df[['Unidades']+cols[11:21]],df[['Unidades'] + cols[21:30]]]
        self.cuadros = cuadros


if __name__ == "__main__":
    reporte = Reporte("plantilla_0.xlsx","A",(2,2))
    celdas = ['A126','A159','A201']

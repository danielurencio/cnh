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
        self.sheet_ = self.wb.sheets["B"]
        self.query_bloques = "SELECT NOMBRE_BLOQUE,ID_BLOQUE,CONTRATO,PROV_GEO,PLAYS,LITOLOGIA,HIDROC_PRINCIPAL,SUPERFICIE,TIRANTE_PROM,PROB_EXITO_GEO_MAX,PROB_EXITO_GEO_MIN,REC_PROSP_MEDIO,REC_PROSP_TOT_RIESGO FROM DATOS_LICITACIONES_BLOQUES1 WHERE RONDA ='"+str(licitacion[0])+"' AND LICITACION = '"+str(licitacion[1])+"' AND NOMBRE_BLOQUE != 'AP-PY-G01'"
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
        self.sheet.range("H10").value = df.shape[0]
        # Provincias geologicas
        prov_geo = sorted(df.prov_geo.unique().tolist())
        prov_geo = reduce(lambda x,y: x + ', ' + y,prov_geo)
        self.sheet.range("H11").value = prov_geo
        # Edades del Play
        plays = self.Unicos(df.plays.unique().tolist())
        self.sheet.range("H13").value = plays
        # Litologias
        litos = self.Unicos(df.litologia.unique().tolist())
        self.sheet.range("H21").value = litos
        # Hidrocarburo principal
        hidroc = self.Unicos(df.hidroc_principal.unique().tolist())
        self.sheet.range("H26").value = hidroc
        # Tipo de contrato
        contrato = self.Unicos(df.contrato.unique().tolist())
        self.sheet.range("H28").value = contrato.upper()

    def graficos_resumen(self,celdas):
        df = self.tabla_ofertas
        # Empresas que adjudicaron
        emps_ = df[df['id_licitante'] == df['id_licitante_adj']]
        emps = emps_['empresa'].unique().shape[0]
        emps_noAdj = df['empresa'].unique().shape[0] - emps
        self.sheet_.range(celdas[0]).value = ["Adjudicaron","No adjudicaron"]
        self.sheet_.range(celdas[1]).value = [emps,emps_noAdj]
        # Bloques adjudicados
        bloques_adj = len(df[['id_bloque','id_licitante_adj']].dropna()["id_bloque"].unique().tolist())
        bloques_noAdj = len(df['id_bloque'].unique().tolist()) - bloques_adj
        self.sheet_.range(celdas[2]).value = ['Adjudicados','No adjudicados']
        self.sheet_.range(celdas[3]).value = [bloques_adj,bloques_noAdj]
        # Numero de ofertas promedio por bloque
        desiertos = df[pd.isnull(df['id_licitante_adj'])]['id_bloque'].unique().shape[0]
        desiertos = int(desiertos)
        ofertasXbloque = df[df['validez']=='VALIDA'][['id_bloque','id_licitante']].drop_duplicates().groupby("id_bloque").count().id_licitante.sum()
        bloques_total = int(bloques_adj) + int(bloques_noAdj)
        ofertasXbloque /= bloques_total
        self.sheet_.range(celdas[4]).value = round(ofertasXbloque,1)
        # Numero de empresas participantes por pais
        paises = df[["pais","empresa"]].drop_duplicates().groupby("pais").count()
        paises = paises.sort_values("empresa",ascending=False).reset_index().values
        self.sheet_.range(celdas[5]).value = paises
        # Bloques adjudicados por empresa
        bloquesXempresa = emps_[["empresa","id_bloque"]].groupby("empresa").count().sort_values("id_bloque",ascending=False)
        bloquesXempresa = bloquesXempresa.reset_index().values
        self.sheet_.range(celdas[6]).value = bloquesXempresa


    def analisis_ofertas(self):
        df = self.tabla_ofertas
        vpos = df[df["validez"] == "VALIDA"][['id_licitante','id_bloque','vpo']].drop_duplicates()
        # Competitividad de ofertas
        promediosVpos = vpos[['id_bloque','vpo']].groupby("id_bloque").mean()
        promediosVpos.rename(columns={'vpo':'promedio_vpo'},inplace=True)
        maximoVpos = vpos[['id_bloque','vpo']].groupby("id_bloque").max()
        maximoVpos.rename(columns={'vpo':'maximo_vpo'},inplace=True)
        minimoVpos = vpos[['id_bloque','vpo']].groupby("id_bloque").min()
        minimoVpos.rename(columns={'vpo':'minimo_vpo'},inplace=True)
        promedioYmax = promediosVpos.join(maximoVpos).join(minimoVpos).reset_index()
        promedioYmax.id_bloque = promedioYmax.id_bloque.map(self.fixIDtoSort)
        promedioYmax.sort_values("id_bloque",inplace=True)
        promedioYmax["rango"] = promedioYmax["maximo_vpo"] - promedioYmax["minimo_vpo"]
        self.sheet.range("A365").value = promedioYmax.values
        # Boxplot
        box = vpos[["id_bloque","vpo"]]
        max_length = box.groupby("id_bloque").count().vpo.max()
        obj = {}
        areas = box.id_bloque.unique().tolist()
        for i in areas:
            arr = box[box["id_bloque"] == i].values[:,1]
            if int(arr.shape[0]) < max_length:
                z = [np.nan for j in xrange(max_length - int(arr.shape[0]))]
                z = np.array(z)
                arr = np.concatenate((arr,z))
            obj[i] = arr
        boxplot = pd.DataFrame(obj)
#        self.sheet.range("A428").value = box.groupby("id_bloque").count()
        # Ofertas individuales y en consorcio
        ofertas = df[df["validez"] == 'VALIDA'][["id_bloque","id_licitante"]].drop_duplicates()
        ofertas_ = []
        for a in areas:
            obj_ = {}
            lics = ofertas[ofertas["id_bloque"] == a].values[:,1]
            obj_["bloque"] = a
            obj_["individual"] = 0
            obj_["consorcio"] = 0
            for l in lics:
                tipo = len(df[df['id_licitante'] == l]["empresa"].unique().tolist())
                if tipo > 1:
                    obj_["consorcio"] += 1
                else:
                    obj_["individual"] += 1
            ofertas_.append(obj_)
        ofertas_ = pd.DataFrame(ofertas_)
        ofertas_.bloque = ofertas_.bloque.map(self.fixIDtoSort)
        ofertas_.sort_values("bloque",inplace=True)
        self.sheet.range("A428").value = ofertas_

    def fixIDtoSort(self,x):
        arr=len(x.split("-")[1])
        id = re.sub("-","-0",x) if arr == 1 else x
        return id

        
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
        ofertas = self.tabla_ofertas
        ofertas = ofertas[ofertas['id_licitante'] == ofertas['id_licitante_adj']]
        ofertas = ofertas[['id_bloque','licitante','var_adj1','var_adj2','bono']].set_index("id_bloque")
        ofertas.licitante = ofertas.licitante.str.replace(';',', ')
        ofertas.bono = ofertas.bono.map(lambda x:round(x/1000,1) if isinstance(x,float) else x)
        df = self.tabla_bloques.drop(['contrato','prob_exito_geo_min','prob_exito_geo_max','tirante_prom'],axis=1)
        df = df.set_index("id_bloque").join(ofertas).drop_duplicates()
        df.index = df.index.map(self.fixIDtoSort)
        df.sort_index(inplace=True)
        df.reset_index(inplace=True)
        df.drop("id_bloque",inplace=True,axis=1)
        nombres = {'prov_geo':u'Provincia geol\xf3gica','plays':'Edades del Play','litologia':u'Litolog\xeda','hidroc_principal':'Hidrocarburo principal','superficie':'Superficie','rec_prosp_tot_riesgo':'Recurso prospectivo total con riesgo', 'rec_prosp_medio':'Recurso prospectivo medio','licitante':'Ganador','var_adj1':u'Regal\xeda adicional', 'var_adj2':u'Factor de inversi\xf3n adicional','bono':'Bono' }
        df.rename(columns=nombres,inplace=True)
        df.set_index('nombre_bloque',inplace=True)
        df = df.T
        unidades = [None, None, None, None, u'km\xb2', 'MMbpce', 'MMbpce',None,'%','%',u'Miles de d\xf3lares']
        df['Unidades'] = pd.Series(np.array(unidades),index=df.index)
        cols = df.columns.tolist()
        unidades = cols[len(cols)-1]
        cols.remove(unidades)
        cols.insert(0,unidades)
        df = df[cols]
        cuadros = [df[['Unidades']+cols[1:11]],df[['Unidades']+cols[11:21]],df[['Unidades'] + cols[21:30]]]
        self.cuadros = cuadros


    def tabla_totales(self):
        cuadros = map(lambda x:x.drop("Unidades",axis=1).T,self.cuadros)
        cuadros = pd.concat(cuadros)
        adj = cuadros[pd.isnull(cuadros[u'Regal\xeda adicional']) == False]
        self.sheet.range("I264").value = adj["Superficie"].sum()
        self.sheet.range("I265").value = adj["Recurso prospectivo medio"].sum()
        self.sheet.range("I267").value = adj["Recurso prospectivo total con riesgo"].sum()
        self.sheet.range("E264").value = cuadros["Superficie"].sum()
        self.sheet.range("E265").value = cuadros["Recurso prospectivo medio"].sum()
        self.sheet.range("E267").value = cuadros["Recurso prospectivo total con riesgo"].sum()
        self.sheet.range("G264").value = cuadros["Superficie"].mean()
        self.sheet.range("G265").value = cuadros["Recurso prospectivo medio"].mean()
        self.sheet.range("G267").value = cuadros["Recurso prospectivo total con riesgo"].mean()
        self.sheet.range("I269").value = round(cuadros["Bono"].sum()/1000,1)

#        return adj


if __name__ == "__main__":
    reporte = Reporte("plantilla_0.xlsx","A",(2,4))
    celdas_tablas = ['A187','A221','A248']
    # [EmpsAdj,..,bloquesAdj,..,ofertasXbloque,empsXpais,bloquesXempresa]
    celdas_resumen = ['A333','A334','A336','A337','A340','D334','I334']


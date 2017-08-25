#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re
import pandas as pd
import numpy as np

f_ = pd.ExcelFile("Licitaciones_ContratosV2.xlsx")
sheets = f_.sheet_names
localizacion = f_.parse(sheets[0],skiprows=3)
caracteristicas = f_.parse(sheets[1],skiprows=3,skipfooter=2)
#perfiles = f_.parse(sheets[4],skiprows=4)

localizacion.set_index("ID",inplace=True)
caracteristicas.set_index("ID",inplace=True)

localizacion.drop(["RONDA","LIC"],inplace=True,axis=1)

bloques = localizacion.join(caracteristicas)
bloques.reset_index(inplace=True)
bloques.drop('Unnamed: 13',axis=1,inplace=True)

cols = bloques.columns.tolist()

for i in cols:
  bloques[i] = bloques[i].map(lambda x: x.upper() if isinstance(x,unicode) and not pd.isnull(x) else x)

bloques["API"].replace("--",np.NaN,inplace=True)
bloques["PROF_PROM"].replace("-",np.NaN,inplace=True)
#bloques["NUM"] = bloques["NUM"].map(lambda x: x.split(u"ÁREA ")[1] if not pd.isnull(x) and isinstance(x,unicode) else x)

#bloques["NUM"] = bloques[(bloques["RONDA"] == 2) & (bloques["LIC"] == 1)].apply(lambda x:x.AREA.split(" ")[1],axis=1)

#bloques["NUM"] = bloques[(bloques["RONDA"] == 1) & (bloques["LIC"] == 1)].apply(lambda x:x.AREA.split(" ")[1],axis=1)

#bloques["NUM"] = bloques[(bloques["RONDA"] == 2) & (bloques["LIC"] == 2)].apply(lambda x:x.AREA.split(" ")[1],axis=1)


bloques = bloques[['ID','AREA','NUM','PROV_GEO','CUENCA','ESTADO','SUPERFICIE','UBICACION ','RONDA','LIC','PLAYS','LITOLOGIA','COB_SIS','HCBRO','API','TIRANTE_PROM','TIRANTE_MAX','TIRANTE_MIN','PROF_PROM','CAMPOS']]

bloques.set_index("ID",inplace=True)

bloques.to_csv("DATOS_LICITACIONES_bloques_nuevo.csv", header=None,encoding="latin1")

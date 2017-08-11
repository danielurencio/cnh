import pandas as pd
import numpy as np

procesos = pd.read_csv("PRocesos__.csv")
empresas = pd.read_csv("EMpresas.csv")
licitantes = pd.read_csv("LIcitantes.csv")
procesos["id_new"] = np.zeros(procesos.shape[0])
id_new = np.zeros(procesos.shape[0])

for i,r in procesos[procesos["nombre"].str.contains("JAPAN OIL")].iterrows():
    procesos.ix[i,"nombre"] = "JAPAN OIL; GAS AND METALS NATIONAL CORPORATION"

def checar():
    for i,row_i in procesos.iterrows():
        for j,row_j in empresas.iterrows():
	    if(row_i["nombre"] == row_j["EMPRESA"]):
	        id_new[i] = row_j["ID_EMPRESA"]
#		print id_new[i]
    procesos["id_new"] = id_new

checar()

protoConsorcios = procesos[(procesos["id"]==1000) & (procesos["id_new"]==0)]
consorciosReales = procesos[(procesos["id"]!=1000) & (procesos["id_new"]==0)]
licitantesIndividualesReconocidos = procesos[(procesos["id"]!=1000) & (procesos["id_new"]!=0)]
licitantesIndividualesNoReconocidos = procesos[(procesos["id"]==1000) & (procesos["id_new"]!=0)]

def NuevoDF(arr_var):
	arrRestos = []
	for i in arr_var["nombre"].tolist():
	  b = i.split(",")
	  for j in b:
	    arrRestos.append(j)

	arr1 = []
	for i in arrRestos:    
	    match = procesos[(procesos["nombre"].str.contains(i)) & (procesos["id_new"] ==0 )]
	    for j,r in match.iterrows():
	      nombre = match.ix[j,"nombre"]
	      ronda  = match.ix[j,"ronda"]
	      licitacion = match.ix[j,"licitacion"]
	      dataroom = match.ix[j,"dataroom"]
	      precalif = match.ix[j,"precalif"]
	      arr1.append([i,nombre,ronda,licitacion,dataroom,precalif])

	arr1 = np.array(arr1)
	arr1 = pd.DataFrame({ 'empresa':arr1[:,0], 'nombre':arr1[:,1], 'ronda':arr1[:,2], 'licitacion':arr1[:,3], 'dataroom':arr1[:,4],'precalif':arr1[:,5] })
	arr1['id_new'] = np.zeros(arr1.shape[0])

	for i,r_i in arr1.iterrows():
	    for j,r_j in empresas.iterrows():
		if( r_i["empresa"] == r_j["EMPRESA"] ):
		    arr1.ix[i,"id_new"] = r_j["ID_EMPRESA"]

	return arr1.drop_duplicates()

mmerge1 = NuevoDF(protoConsorcios).append(NuevoDF(consorciosReales)).drop_duplicates()
mmerge2 = licitantesIndividualesReconocidos.append(licitantesIndividualesNoReconocidos)
mmerge2["empresa"] = mmerge2["nombre"]
mmerge1["id"] = np.zeros(mmerge1.shape[0])

mmerge3 = mmerge1.append(mmerge2)

for i,r_i in mmerge3.iterrows():
  for j,r_j in licitantes.iterrows():
    if(r_i["nombre"] == r_j["LICITANTE"]):
      mmerge3.ix[i,"id"] = r_j["ID_LICITANTE"]

obj = {
  'id_new':'ID_EMPRESA',
  'id':'ID_LICITANTE',
  'dataroom':'DATAROOM',
  'empresa':'EMPRESA',
  'nombre':'NOMBRE_LICITANTE',
  'precalif':'PRECALIF',
  'ronda':'RONDA',
  'licitacion':'LICITACION'
};

mmerge3.rename(columns=obj,inplace=True)
mmerge3['ID_LICITANTE'].replace(1000,np.nan, inplace=True)
mmerge3['ID_LICITANTE'].replace(0,np.nan, inplace=True)

mmerge3.to_csv("procesos.csv",index=False)

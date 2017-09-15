import cx_Oracle
from sqlalchemy import create_engine
import pandas as pd
import numpy as np
import sys

## ESTE SCRIPT TIENE COMO PROPOSITO CREAR, NUEVAMENTE, LAS TABLAS INTERMEDIAS 'LIC_EMP' Y 'LIC_MAT'. ES NECESARIO PROPORCIONAR UN STRING DE CONEXION PARA EXTRAER LAS ULTIMAS VERSIONES DE LA TABLA DE EMPRESAS Y LA TABLA DE LICITANTES.

conn = sys.argv[1]#'oracle://cmde_raw:raw17@172.16.120.3:1521/cnih'
engine = create_engine(conn);
query_empresas = "SELECT * FROM DATOS_LICITACIONES_EMPRESAS"
query_licitantes = "SELECT * FROM DATOS_LICITACIONES_LICITANTES"

empresas = pd.read_sql(query_empresas,engine)
licitantes = pd.read_sql(query_licitantes,engine)

lic_emp = []
for lic in licitantes["licitante"].tolist():
  id_licitante = licitantes[licitantes["licitante"] == lic].id_licitante.values[0]
  lics = lic.split(";")
  for l in lics:
    id_empresa = empresas[empresas["empresa"] == l].id_empresa.values[0]
    id_matriz = empresas[empresas["empresa"] == l].id_matriz.values[0]
    lic_emp.append([id_licitante,id_empresa,id_matriz])

lic_emp = np.array(lic_emp)
obj = {'ID_LICITANTE':lic_emp[:,0],'ID_EMPRESA':lic_emp[:,1],'ID_MATRIZ':lic_emp[:,2]}

df = pd.DataFrame(obj)
df = df[['ID_LICITANTE','ID_EMPRESA','ID_MATRIZ']]

licEmp = df[["ID_LICITANTE","ID_EMPRESA"]].copy()
licMat = df[["ID_LICITANTE","ID_MATRIZ"]].copy().drop_duplicates()

licEmp.to_csv("lic_emp.csv",header=None,index=False)
licMat.to_csv("lic_mat.csv",header=None,index=False)
print("LISTO!")

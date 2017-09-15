# encoding=UTF-8
import sys
reload(sys)
sys.setdefaultencoding("UTF-8")
import re
import math
import pandas as pd
import numpy as np

excel = pd.ExcelFile("Copia de Base concentrada v4.xlsx")
sheets = excel.sheet_names
for i in ["Concentrado","Hoja2","Adjudicados","Licitaciones","Rondas","Resultados","Generales","DPCache_Hoja2"]:
    sheets.remove(i)

sheets.sort()
skips = [5,12,7,12]
bloques = excel.parse("Generales",skiprows=6)
bloques.set_index("Identificador",inplace=True)

campos = excel.parse("Reservas",skiprows=12)
dict = {}

# Crear un diccionario con tadas las tablas y hacer que el Identificador sea su inx
for sheet,skip in zip(sheets,skips):
    if(sheet != "Reservas"):
        dict[sheet] = excel.parse(sheet,skiprows=skip)
        dict[sheet].set_index("Identificador",inplace=True)
    else:
	reservas = excel.parse(sheet,skiprows=skip)
	reservas = reservas.groupby('Identificador').sum()
	dict[sheet] = reservas
    bloques = bloques.join(dict[sheet],how='outer')


# Sustituir valores con la palabra "Área" en la columna "Número de bloque"
cambios = bloques[bloques[bloques.columns[3]].str.contains("rea") == 1 ][bloques.columns[3]].tolist()
dic1 = {}
for i in cambios:
    k = i.split(" ")[1]
    dic1[i] = k

bloques[bloques.columns[3]].replace(dic1,inplace=True)

# Convertir a int los números de bloque
bloques[bloques.columns[3]] = bloques[bloques.columns[3]].map(lambda x: int(x) if(pd.isnull(x)!=1) else x )

# Convertir todo a mayúsculas, cuando aplique.
for i in bloques.columns:
    bloques[i] = bloques[i].map(lambda x: x.upper() if(not pd.isnull(x) and isinstance(x,basestring)) else x)
bloques.index = bloques.index.map(lambda x: x.upper())

# Quitar la palabra "BLOQUE" de la columna "Nombre del bloque" cuando aplique.
bloques["Nombre del bloque"] = bloques["Nombre del bloque"].map(lambda x: x.split(" ")[1] if(re.search("BLOQUE",str(x))) else x)

# Existe un valor con dos opciones (EXPLORACIÓN: 2090 & EVALUACIÓN:2270-2570)
bloques.ix["ASOC-TRION","Tirante de agua promedio (mts)"] = 2090

bloques.sort_values(['Ronda',bloques.columns[1],bloques.columns[3]],ascending=[True,True,True],inplace=True)


# Cambiar nombre de columnas
def cambiarCol(x):
    x = x.upper()
    regex = [('Á','A'),('É','E'),('Í','I'),('\xc3\x93','O'),('Ú','U'),('[(][%][)]','PORCENTAJE'),('[(]',''),('[)]',''),(' / ',' '),('  *',' '),(' ','_'),(':',''),('PROGRAMA_MINIMO_DE_TRABAJO','PMT'),('UNIDADES_DE_TRABAJO','UNIDADES')]
    for r1,r2 in regex:
	x = re.sub(r1,r2,str(x))
    return x

bloques.columns = bloques.columns.map(cambiarCol)
bloques['PMT_ACTIVIDADES'] = bloques.PMT_ACTIVIDADES.map(lambda x: re.sub("[.]$","",x) if(not pd.isnull(x)) else x)
campos.columns = campos.columns.map(cambiarCol)

for i in ["IDENTIFICADOR","CAMPOS"]:
    campos[i] = campos[i].map(lambda x: x.upper())

campos.set_index("IDENTIFICADOR",inplace=True)
campos.index.rename("ID_BLOQUE",inplace=True)
bloques.index.rename("ID_BLOQUE",inplace=True)
HEAD = True

for i in ["PLAYS_YACIMIENTO","LITOLOGIA"]:
  bloques[i] = bloques[i].map(lambda x: re.sub("\n","",str(x)))

def importar():
    bloques.to_csv("DATOS_LICITACIONES_bloques.csv",encoding="utf-8",header=HEAD)
    campos.to_csv("DATOS_LICITACIONES_campos.csv",encoding="utf-8",header=HEAD)
    print("ARCHIVOS IMPORTADOS.")


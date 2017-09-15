# coding=utf-8
import sys
reload(sys)
sys.setdefaultencoding("UTF-8")
import re
from datetime import datetime
import pandas as pd
import numpy as np

DATA_PATH = './'
archivo = 'DATOS_BDI_gas_por_estado.xlsx'
hoja = "Datos"
skip_rows = 5
tipos = [(5,14,"Gas Asociado"),(16,23,"Gas no Asociado")]


class BDI_transposer:
    def __init__(self,archivo,hoja,skip_rows,rangos,nombre_import):
	self.archivo = archivo
	self.hoja = hoja
	self.skip_rows = skip_rows
	self.rangos = rangos
	self.nombre_import = nombre_import
	self.tipos = rangos
	self.df = self.read_excel()
	self.df_real = pd.DataFrame(columns=['FECHA','E','TIPO_GAS',\
		'ESTADO','MMPCD']);

    def read_excel(self):
	df = pd.read_excel(DATA_PATH + self.archivo, sheetname=self.hoja, \
		skiprows=self.skip_rows,skip_footer=0)
	df.dropna(how="all", inplace=True)
	return df

    def concatenar(self):
	fechas = self.df.T.index[3:].values.astype(str)
	M = {'ENE':'1','FEB':'2','MAR':'3','ABR':'4','MAY':'5','JUN':'6',\
		'JUL':'5','AGO':'8','SEP':'9','OCT':'10','NOV':'11','DIC':'12'}
	for tuple in self.rangos:
	    print(tuple)
    	    for j in range(tuple[0],tuple[1]):
		print(j); entidad = ''
        	valores = self.df.T[j][3:]
        	E = str(self.df.T[j][0])
        	entidad = str(self.df.T[j][2])
        	entidad = re.sub("\s\s+","",entidad)
		print(entidad)
        	temp_df = pd.DataFrame({ 'FECHA':fechas,'E':E,\
			'TIPO_GAS':tuple[2],'ESTADO':entidad,'MMPCD':valores })
        	temp_df = temp_df[['FECHA','E','TIPO_GAS','ESTADO','MMPCD']]
        	self.df_real = self.df_real.append(temp_df, ignore_index=True)
	mes = self.df_real["FECHA"].map(lambda r: r.split("/")[0]).replace(M)
	Y = self.df_real["FECHA"].map(lambda r: r.split("/")[1])
	self.df_real["FECHA"] = mes + "/" + Y
	self.df_real["FECHA"] = self.df_real["FECHA"].map(\
		lambda r: datetime.strptime(r,"%m/%Y"))

    def importar(self):
	self.concatenar()
	self.df_real.to_csv(self.nombre_import + ".csv",index=0,\
		encoding='UTF-8',header=0)


if __name__ == '__main__':
    a = BDI_transposer(DATA_PATH + archivo, hoja, 5, tipos, "gas_por_estado")
    a.importar()

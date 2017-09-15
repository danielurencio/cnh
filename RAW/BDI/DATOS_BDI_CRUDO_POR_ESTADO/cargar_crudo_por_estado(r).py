# coding=utf-8
import sys
reload(sys)
sys.setdefaultencoding("UTF-8")
import re
from datetime import datetime
import pandas as pd
import numpy as np

DATA_PATH = './'

class BDI_transposer:
    def __init__(self,archivo,hoja,skip_rows,nombre_import):
        self.archivo = archivo
	self.hoja = hoja
	self.skip_rows = skip_rows
	self.df = self.read_excel()
	self.df_real = pd.DataFrame(columns=['FECHA','E','ESTADO','MBD'])
	self.fechas = []
	self.nombre_import = nombre_import

    def read_excel(self):
        df = pd.read_excel(DATA_PATH + self.archivo,\
	  sheetname=self.hoja, skiprows=self.skip_rows, skip_footer = 0)
	df.dropna(how="all", inplace=True)
	return df

    def concatenar(self):
	fechas = self.df.T.index.values.astype(str)[3:]
	for i in range(3,12):
    	    serie = self.df.loc[i][0:1].astype(str).values.tolist()[0]
    	    entidad = self.df.loc[i][2:3].astype(str).values.tolist()[0]
    	    entidad = re.sub('\s\s+','',entidad)
    	    mbd = self.df.loc[i][3:].values.tolist()
    	    temp_df = pd.DataFrame({'FECHA':fechas, 'E':serie, 'ESTADO':entidad, 'MBD':mbd });
    	    temp_df = temp_df[['FECHA','E','ESTADO','MBD']]
    	    self.df_real = self.df_real.append(temp_df, ignore_index=True)
	M = {'ENE':'1','FEB':'2','MAR':'3','ABR':'4','MAY':'5','JUN':'6','JUL':'5','AGO':'8','SEP':'9','OCT':'10','NOV':'11','DIC':'12'}
	meses = self.df_real["FECHA"].map(lambda r: r.split("/")[0])
	Y = self.df_real["FECHA"].map(lambda r: r.split("/")[1])
	meses = meses.replace(M)
	self.df_real["FECHA"] = meses + "/" + Y
	self.df_real["FECHA"] = self.df_real["FECHA"].map(lambda r: datetime.strptime(r,"%m/%Y"))

    def importar(self):
	self.concatenar()
	self.df_real.to_csv(self.nombre_import + "_por_estado.csv",index=0,header=0)


if __name__ == '__main__':
    a = BDI_transposer("DATOS_BDI_crudo_por_estado.xlsx","Datos",5,"crudo")
    a.importar()


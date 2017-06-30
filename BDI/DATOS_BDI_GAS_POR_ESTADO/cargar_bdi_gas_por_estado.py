# coding=utf-8
import sys
import codecs
import re
import matplotlib.pyplot as plt
reload(sys)
sys.setdefaultencoding('UTF-8')
import pandas as pd
from unidecode import unidecode
import numpy as np


#DATA_PATH = open('./data_path.txt').readline().strip()
DATA_PATH = './'


class BDI_transposer:
    def __init__(self,path,stname,var_name,skiprows,skiplast,skipmorerows=''):
        self.path = path
        self.skiprows = skiprows
        self.skipfooter = skiplast 
        self.stname = stname
        self.var_name=var_name
        self.skipmorerows = skipmorerows
        self.months = {'abr':'4','ene':'1','feb':'2',
        'mar':'3','may':'5','jun':'6',
        'jul':'7','ago':'8','sep':'9',
        'oct':'10','nov':'11',
        'dic':'12'}
        self.read_excel()

    def not_null_ESTADO(self,r):
        if str(r['E']).startswith('#'): 
            return r['Unnamed: 2']
        elif not pd.isnull(r['TIPO_GAS']):
            return ''
        else:
            return np.NaN

    def tipo_dato(self,r):
        if r['ESTADO'] == '':
            return 'TIPO_GAS'
        else:
            return 'ESTADO'


    def read_excel(self):
        self.df = pd.read_excel(self.path,sheetname=self.stname,
                skiprows = self.skiprows, skip_footer = self.skipfooter)
        self.df.dropna(how='all',inplace=True)
	#print(self.df.columns)
        self.df2 = self.df[(self.df[u'Unnamed: 2'].notnull())]
        self.df2 = self.df2[(self.df2[u'E'].notnull())]
        if self.skipmorerows:
            self.df2 = self.df2[self.skipmorerows:]

        #self.df2.fillna('-',inplace=True)

        self.df2['TIPO_GAS'] = self.df2.apply(lambda r: r['Unnamed: 2'] if str(r['E']).
                startswith('&tg') else np.NaN,axis = 1)
        self.df2['ESTADO'] = self.df2.apply(self.not_null_ESTADO,axis = 1)
        self.df2['TIPO_GAS'].fillna(method = 'ffill',inplace=True)
        self.df2['ESTADO'].fillna(method = 'ffill',inplace=True)	
        return self.df2

    def change_month(self,r):
        v = str(r['index']).lower()
        for k in self.months:
            v = v.replace(k,self.months[k])
        return v

    def transponer(self):
        self.df2 = self.df2.loc[(self.
            df2['ESTADO']!='') & (self.df2['ESTADO'].notnull())] 
        headers = self.df2[['E','TIPO_GAS','ESTADO']]
        headers.reset_index(inplace=True)
        not_headers = self.df2.copy() 
        not_headers.reset_index(inplace=True)
        del not_headers['E'], not_headers['TIPO_GAS'], \
                not_headers['ESTADO'], not_headers['index'],\
		not_headers['Unnamed: 2'], not_headers[self.var_name]
	#print(not_headers)
	#raw_input()
        not_headers = not_headers.T
        not_headers.reset_index(inplace=True)
        not_headers['index2'] = not_headers.apply(self.change_month,axis=1)
	#print(not_headers)
        not_headers['FECHA'] = pd.to_datetime(not_headers['index2'], 
                format = '%m/%Y')
        del not_headers['index'], not_headers['index2']
        complete_db = pd.DataFrame()
        for i in xrange(len(not_headers.columns)-1):
            if i == 0:
                complete_db = not_headers[['FECHA',i]].copy()
                complete_db['E'] = headers.loc[i,'E']
                complete_db['TIPO_GAS'] = headers.loc[i,'TIPO_GAS']
                complete_db['ESTADO'] = headers.loc[i,'ESTADO']
                complete_db.rename(columns={i:self.var_name},inplace=True)
            else:
                partial_db = not_headers[['FECHA',i]].copy()
                partial_db['E'] = headers.loc[i,'E']
                partial_db['TIPO_GAS'] = headers.loc[i,'TIPO_GAS']
                partial_db['ESTADO'] = headers.loc[i,'ESTADO']
                partial_db.rename(columns={i:self.var_name},inplace=True)
                complete_db = complete_db.append(partial_db)

        complete_db = complete_db[['FECHA','E','TIPO_GAS',
            'ESTADO',self.var_name]]
        return complete_db


if __name__ == '__main__':
    #a = BDI_transposer(DATA_PATH+'/BDI-crudo_por_PROYECTO.xlsx',
    #        'Datos','MMbd',5,0)
    #a2 = a.transponer()
    #a2.groupby(['FECHA']).sum().plot(kind='bar')
    #plt.show()
    a = BDI_transposer(DATA_PATH+'/DATOS_BDI_gas_por_estado.xlsx',
            'Datos','MMpcd',5,0)
    #print a.df2.columns
    a2 = a.transponer()
    #print(a2)
    a2.to_csv("gas_por_estado.csv",encoding="UTF-8",index=False,header=False);
    #b2 = a2.groupby(['FECHA']).sum()
    #b2.plot(kind='bar')
    #b2.to_excel('/Users/roberto/Desktop/prueba2.xlsx')
    #plt.show()

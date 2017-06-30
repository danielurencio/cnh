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

    def not_null_REGION(self,r):
        if str(r['E']).startswith('&rn') or str(r['E']).startswith('&rm') or str(r['E']).startswith('&rs'):
            return r['Unnamed: 2']
        elif not pd.isnull(r['TIPO_PRODUCTOR']):
            return ''
        else:
            return np.NaN

    def not_null_ACTIVO(self,r):
        if not(str(r['E']).
                startswith('&rn') or str(r['E']).
                startswith('&rm') or str(r['E']).
                startswith('&rs') or str(r['E']).
                startswith('#')):
            return r['Unnamed: 2']
        elif not pd.isnull(r['REGION']):
            return ''
        else:
            return np.NaN

    def not_null_CAMPO(self,r):
        if str(r['E']).startswith('#'): 
            return r['Unnamed: 2']
        elif not pd.isnull(r['ACTIVO']):
            return ''
        else:
            return np.NaN

    def read_excel(self):
        self.df = pd.read_excel(self.path,sheetname=self.stname,
                skiprows = self.skiprows, skip_footer = self.skipfooter)
        self.df.dropna(how='all',inplace=True)
        self.df2 = self.df[(self.df[u'Unnamed: 2'].notnull())]
        self.df2 = self.df2[(self.df2[u'E'].notnull())]
        if self.skipmorerows != '':
            self.df2 = self.df2[self.skipmorerows:]

        #self.df2.fillna('-',inplace=True)

        self.df2['TIPO_PRODUCTOR'] = self.df2.apply(lambda r: r['Unnamed: 2'] if str(r['E']).
                startswith('&t') else np.NaN,axis = 1)
        self.df2['REGION'] = self.df2.apply(self.not_null_REGION,axis = 1)
        self.df2['ACTIVO'] = self.df2.apply(self.not_null_ACTIVO,axis = 1)
        self.df2['CAMPO'] = self.df2.apply(self.not_null_CAMPO,axis = 1)
        self.df2['TIPO_PRODUCTOR'].fillna(method = 'ffill',inplace=True)
        self.df2['REGION'].fillna(method = 'ffill',inplace=True)
        self.df2['ACTIVO'].fillna(method = 'ffill',inplace=True)
        return self.df2

    def change_month(self,r):
        v = str(r['index']).lower()
        for k in self.months:
            v = v.replace(k,self.months[k])
        return v

    def transponer(self):
        self.df2 = self.df2.loc[(self.
            df2['CAMPO']!='') & (self.df2['CAMPO'].notnull())] 
        headers = self.df2[['E','TIPO_PRODUCTOR','REGION','ACTIVO','CAMPO']]
        headers.reset_index(inplace=True)
        not_headers = self.df2.copy() 
        not_headers.reset_index(inplace=True)
        not_headers.drop(['TIPO_PRODUCTOR','REGION',
                          'CAMPO','SELF','E','ACTIVO',
                          'Unnamed: 2','index'],
                         axis =1, inplace = True)
        not_headers = not_headers.T
        not_headers.fillna(0,inplace=True)
        not_headers.reset_index(inplace=True)
        not_headers['index2'] = not_headers.apply(self.change_month,axis=1)
        not_headers['FECHA'] = pd.to_datetime(not_headers['index2'], 
                format = '%m/%Y')
        not_headers.drop(['index','index2'],axis = 1,inplace=True)
        complete_db = pd.DataFrame()
        for i in xrange(len(not_headers.columns)-1):
            if i == 0:
                complete_db = not_headers[['FECHA',i]].copy()
                complete_db['E'] = headers.loc[i,'E']
                complete_db['TIPO_PRODUCTOR'] = headers.loc[i,'TIPO_PRODUCTOR']
                complete_db['REGION'] = headers.loc[i,'REGION']
                complete_db['ACTIVO'] = headers.loc[i,'ACTIVO']
                complete_db['CAMPO'] = headers.loc[i,'CAMPO']
                complete_db.rename(columns={i:self.var_name},inplace=True)
            else:
                partial_db = not_headers[['FECHA',i]].copy()
                partial_db['E'] = headers.loc[i,'E']
                partial_db['TIPO_PRODUCTOR'] = headers.loc[i,'TIPO_PRODUCTOR']
                partial_db['REGION'] = headers.loc[i,'REGION']
                partial_db['ACTIVO'] = headers.loc[i,'ACTIVO']
                partial_db['CAMPO'] = headers.loc[i,'CAMPO']
                partial_db.rename(columns={i:self.var_name},inplace=True)
                complete_db = complete_db.append(partial_db)

        complete_db.reset_index(inplace=True)
        complete_db = complete_db[['FECHA','E','TIPO_PRODUCTOR','REGION',
            'ACTIVO','CAMPO',self.var_name]]
        #complete_db[self.var_name] = complete_db[self.var_name].astype(int)
        return complete_db


if __name__ == '__main__':
    #a = BDI_transposer(DATA_PATH+'/BDI-crudo_por_PROYECTO.xlsx',
    #        'Datos','MMbd',5,0)
    #a2 = a.transponer()
    #a2.groupby(['FECHA']).sum().plot(kind='bar')
    #plt.show()
    a = BDI_transposer(DATA_PATH+'/DATOS_BDI_pozos_desarrollo_operacion.xlsx',
            'Datos','NUM_POZOS',5,0,3)
    b = a.transponer()
    b.to_csv("pozos_operacion.csv",encoding="UTF-8",index=False,header=False);
    #print a.transponer()
    #print a.transponer().groupby(['FECHA']).sum()

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


    def not_null_ACTIVO(self,r):
        if str(r['E']).startswith('&a'): 
            return r['Unnamed: 2']
        elif not pd.isnull(r['REGION']):
            return ''
        else:
            return np.NaN

    def not_null_PROYECTO(self,r):
        if str(r['E']).startswith('&p'): 
            return r['Unnamed: 2']
        elif not pd.isnull(r['ACTIVO']):
            return ''
        else:
            return np.NaN

    def not_null_CAMPO(self,r):
        if str(r['E']).startswith('#'): 
            return r['Unnamed: 2']
        elif not pd.isnull(r['PROYECTO']):
            return ''
        else:
            return np.NaN

    def tipo_dato(self,r):
        if r['ACTIVO'] == '':
            return 'REGION'
        elif r['PROYECTO'] == '':
            return 'ACTIVO'
        elif r['CAMPO'] == '':
            return 'PROYECTO'
        else:
            return 'CAMPO'

    def tabla_diccionario(self):
        self.df2['CAMPO'] = self.df2.apply(self.not_null_CAMPO,axis = 1)
        self.df2['REGION'].fillna(method = 'ffill',inplace=True)
        self.df2['ACTIVO'].fillna(method = 'ffill',inplace=True)
        self.df2['PROYECTO'].fillna(method = 'ffill',inplace=True)
        self.diccionario = self.df2[['REGION','ACTIVO','PROYECTO','CAMPO']]
        self.diccionario = self.diccionario.loc[self.diccionario['CAMPO']!= '']
        self.diccionario = self.diccionario.dropna()


    def generar_diccionario(self):
        self.tabla_diccionario()
        REGIONes = self.diccionario['REGION'].unique()
        REGIONes2 = [re.sub('\s+',' ',r.strip().replace('-',' ').replace('Región ','')) for r in REGIONes]
        REGIONes3 = [''.join([w for w in unidecode(r) \
                if w.isalnum() or w == ' ']).upper() for r in REGIONes2]
        ACTIVOs = self.diccionario['ACTIVO'].unique()
        ACTIVOs2 = [re.sub('\s+',' ',r.strip().replace('-',' ').
                replace('Activo de Producción ','').
                replace('Activo Integral ',''))for r in ACTIVOs]
        ACTIVOs3 = [''.join([w for w in unidecode(r) \
                if w.isalnum() or w == ' ']).upper() for r in ACTIVOs2]
        PROYECTOs = self.diccionario['PROYECTO'].unique()
        PROYECTOs2 = [re.sub('\s+',' ',r.strip().replace('-',' ')) for r in PROYECTOs]
        PROYECTOs3 = [''.join([w for w in unidecode(r) \
                if w.isalnum() or w == ' ']).upper() for r in PROYECTOs2]
        CAMPOs = self.diccionario['CAMPO'].unique()
        CAMPOs2 = [re.sub('\s+',' ',r.strip().replace('-',' ')) for r in CAMPOs]
        CAMPOs3 = [''.join([w for w in unidecode(r) \
                if w.isalnum() or w == ' ']).upper() for r in CAMPOs2]
        return (zip(REGIONes3,REGIONes2),zip(ACTIVOs3,ACTIVOs2),
                zip(PROYECTOs3,PROYECTOs2),zip(CAMPOs3,CAMPOs2))


    def read_excel(self):
        self.df = pd.read_excel(self.path,sheetname=self.stname,
                skiprows = self.skiprows, skip_footer = self.skipfooter)
        self.df.dropna(how='all',inplace=True)
        self.df2 = self.df[(self.df[u'Unnamed: 2'].notnull())]
        self.df2 = self.df2[(self.df2[u'E'].notnull())]
        if self.skipmorerows:
            self.df2 = self.df2[self.skipmorerows:]

        #self.df2.fillna('-',inplace=True)

        self.df2['REGION'] = self.df2.apply(lambda r: r['Unnamed: 2'] if str(r['E']).
                startswith('&r') else np.NaN,axis = 1)
        self.df2['ACTIVO'] = self.df2.apply(self.not_null_ACTIVO,axis = 1)
        self.df2['PROYECTO'] = self.df2.apply(self.not_null_PROYECTO,axis = 1)
        self.df2['CAMPO'] = self.df2.apply(self.not_null_CAMPO,axis = 1)
        self.df2['REGION'].fillna(method = 'ffill',inplace=True)
        self.df2['ACTIVO'].fillna(method = 'ffill',inplace=True)
        self.df2['PROYECTO'].fillna(method = 'ffill',inplace=True)
        return self.df2

    def change_month(self,r):
        v = str(r['index']).lower()
        for k in self.months:
            v = v.replace(k,self.months[k])
        return v

    def transponer(self):
        self.df2 = self.df2.loc[(self.
            df2['CAMPO']!='') & (self.df2['CAMPO'].notnull())] 
        headers = self.df2[['E','REGION','ACTIVO','PROYECTO','CAMPO']]
        headers.reset_index(inplace=True)
        not_headers = self.df2.copy() 
        not_headers.reset_index(inplace=True)
        del not_headers['REGION'], not_headers['ACTIVO'], \
                not_headers['PROYECTO'], not_headers['CAMPO'], \
                not_headers[self.var_name], not_headers['Unnamed: 2'], \
                not_headers['E'], not_headers['index']
        not_headers = not_headers.T
        not_headers.reset_index(inplace=True)
        not_headers['index2'] = not_headers.apply(self.change_month,axis=1)
        not_headers['FECHA'] = pd.to_datetime(not_headers['index2'], 
                format = '%m/%Y')
        del not_headers['index'], not_headers['index2']
        complete_db = pd.DataFrame()
        for i in xrange(len(not_headers.columns)-1):
            if i == 0:
                complete_db = not_headers[['FECHA',i]].copy()
                complete_db['E'] = headers.loc[i,'E']
                complete_db['REGION'] = headers.loc[i,'REGION']
                complete_db['ACTIVO'] = headers.loc[i,'ACTIVO']
                complete_db['PROYECTO'] = headers.loc[i,'PROYECTO']
                complete_db['CAMPO'] = headers.loc[i,'CAMPO']
                complete_db.rename(columns={i:self.var_name},inplace=True)
            else:
                partial_db = not_headers[['FECHA',i]].copy()
                partial_db['E'] = headers.loc[i,'E']
                partial_db['REGION'] = headers.loc[i,'REGION']
                partial_db['ACTIVO'] = headers.loc[i,'ACTIVO']
                partial_db['PROYECTO'] = headers.loc[i,'PROYECTO']
                partial_db['CAMPO'] = headers.loc[i,'CAMPO']
                partial_db.rename(columns={i:self.var_name},inplace=True)
                complete_db = complete_db.append(partial_db)

        complete_db = complete_db[['FECHA','E','REGION',
            'ACTIVO','PROYECTO','CAMPO',self.var_name]]
        return complete_db


if __name__ == '__main__':
    #a = BDI_transposer(DATA_PATH+'/BDI-crudo_por_PROYECTO.xlsx',
    #        'Datos','MMbd',5,0)
    #a2 = a.transponer()
    #a2.groupby(['FECHA']).sum().plot(kind='bar')
    #plt.show()
    a = BDI_transposer(DATA_PATH+'/DATOS_BDI_gas_por_proyecto.xlsx',
            'Datos','MMpcd',5,0)
    a2 = a.transponer()
    a2.to_csv("proyectos_gas.csv",encoding="UTF-8",index=False,header=False);
    #b2 = a2.groupby(['FECHA']).sum()
    #b2.plot(kind='bar')
    #b2.to_excel('/Users/roberto/Desktop/prueba2.xlsx')
    #plt.show()

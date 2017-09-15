import pandas as pd
import numpy as np

procesos = pd.read_csv('procesos_h.csv')

antiguo = pd.read_csv('DATOS_LICITACIONES_licitantes_empresas_H.csv')
nuevo = pd.read_csv('nt_intermedia_licitantes_H.csv')

antiguo = antiguo.groupby('ID_LICITANTE')['ID_EMPRESA'].apply(list)
antiguo = antiguo.map(lambda x: str(sorted(x)))
antiguo = antiguo.reset_index()
antiguo.rename(columns={ 'ID_LICITANTE':'ID_LICITANTE0'},inplace=True)
antiguo.set_index('ID_EMPRESA',inplace=True)
nuevo = nuevo.groupby('ID_LICITANTE')['ID_EMPRESA'].apply(list)
nuevo = nuevo.map(lambda x: str(sorted(x)))
nuevo = nuevo.reset_index()
nuevo.rename(columns={ 'ID_LICITANTE':'ID_LICITANTE1'},inplace=True)
nuevo.set_index('ID_EMPRESA',inplace=True)



rel = nuevo.join(antiguo)
rel.ix['[11, 171]','ID_LICITANTE0'] = 6
rel.ix['[11, 171, 173]','ID_LICITANTE0'] = 31
rel.ix['[45, 171]','ID_LICITANTE0'] = 28
rel.ix['[107, 174, 175, 176]','ID_LICITANTE0'] = 49
rel.ix['[172]','ID_LICITANTE0'] = 10
rel.ix['[173]','ID_LICITANTE0'] = 25
rel.ix['[83, 173]','ID_LICITANTE0'] = 29
rel.ix['[175, 176]','ID_LICITANTE0'] = 78
rel.ix['[41, 99, 175]','ID_LICITANTE0'] = 53
rel.ix['[41, 175]','ID_LICITANTE0'] = 63

rel.dropna(inplace=True)
rel.ID_LICITANTE0 = rel.ID_LICITANTE0.map(lambda x: str(x) if not pd.isnull(x) else x)

CAMBIOS = rel.dropna().set_index('ID_LICITANTE0').to_dict()['ID_LICITANTE1']
bloques = pd.read_csv('DATOS_LICITACIONES_bloques_nuevo_ids.csv')

bloques.id_licitante_adj = bloques.id_licitante_adj.map(lambda x: str(x) if not pd.isnull(x) else x)

bloques.replace({ 'id_licitante_adj':CAMBIOS },inplace=True)
bloques.to_csv('bloques_bien.csv',index=False,encoding="utf-8")
print("BLOQUES BIEN! archivo generado..")
procesos.ID_LICITANTE = procesos.ID_LICITANTE.map(lambda x: str(x) if not pd.isnull(x) else x)
procesos.replace({'ID_LICITANTE':CAMBIOS},inplace=True)
procesos.to_csv('procesos_bien.csv',index=False,encoding='utf-8',header=True)
print("PROCESOS BIEN! archivo generado..")

import datetime
import pandas as pd
import scipy
import requests
import numpy as np

wti_brent = "https://www.eia.gov/dnav/pet/xls/PET_PRI_SPT_S1_D.xls"
henry_hub = "https://www.eia.gov/dnav/ng/hist_xls/RNGWHHDd.xls"
mme = "http://www.banxico.org.mx/SieInternet/consultaSerieGrafica.do?s=SI744,CI38"

oil = pd.read_excel(wti_brent,sheetname="Data 1",skiprows=2)
gas = pd.read_excel(henry_hub,sheetname="Data 1",skiprows=2)

oil.columns = ['FECHA','WTI','BRENT']
gas.columns = ['FECHA','HENRY_HUB']

oil.set_index("FECHA", inplace=True)
gas.set_index("FECHA", inplace=True)

precios = oil.join(gas)

mme = np.array(requests.get(mme).json()["valores"])
mme_ = pd.DataFrame({ 'FECHA': mme[:,0], 'MME': mme[:,1] })
mme_["MME"] = mme_["MME"].map(lambda x: np.NaN if float(x) < 0 else float(x))
mme_.set_index("FECHA", inplace=True)

precios = precios.join(mme_)[["BRENT","WTI","MME","HENRY_HUB"]]
precios["INSERTADO"] = np.zeros(precios.shape[0])

fecha = datetime.date.today()
fecha_ = str(fecha.year) + "-" + str(fecha.month) + "-" + str(fecha.day) 
precios["INSERTADO"] = fecha_

fuentes = 'EIA;EIA;BANXICO;EIA'
precios["FUENTES"] = np.zeros(precios.shape[0])
precios["FUENTES"] = fuentes
precios.index = pd.to_datetime(precios.index)
mme_.index = pd.to_datetime(mme_.index)
extra = mme_[mme_.index > np.max(precios.index)].copy()
#extra.loc[extra.index,"FUENTES"] = "-;-;BANXICO;-"
#extra.loc[extra.index,"INSERTADO"] = fecha_ 
precios = precios.append(extra)

precios = precios[["BRENT","WTI","MME","HENRY_HUB","INSERTADO","FUENTES"]]

precios.to_csv("precios.csv",encoding="latin1",header=None)
print("ARCHIVO GENERADO.")

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

import pandas as pd

file_ = pd.ExcelFile("Licitaciones_ContratosV2.xlsx")

semb = file_.parse("Semblanzas",skiprows=3)#4,names=['nombre','descripcion','id','pais'])
grupos = file_.parse("Empresas",skiprows=4)



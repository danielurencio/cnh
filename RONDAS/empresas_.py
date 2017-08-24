import re
import pandas as pd
import numpy as np
import cx_Oracle
from sqlalchemy import create_engine

f_ = pd.read_csv("base_utf8.csv")

def empresasUnicas():
    arr = []
    empsU = f_["LICITANTE_SISTEMA"].tolist()
    for i in empsU:
        s_ = i.split(";")
        for j in s_:
            r_j = re.sub("^ ","",j)
            r_j = re.sub(" $","",r_j)
	    r_j = re.sub("ENERGY S.L.U.","ENERGY S.L.",r_j)
	    r_j = re.sub("S.A DE","S.A. DE",r_j)
	    arr.append(r_j)
    empsU = sorted(list(set(arr)))
    empsU = pd.DataFrame({ 'EMPRESA': empsU })
    empsU.set_index("EMPRESA",inplace=True)
    empsU.index = empsU.index.map(lambda x: re.sub("^ ","",x))
    return empsU


def empresasRaw(conn):
    engine = create_engine(conn)
    emps = pd.read_sql("SELECT * FROM DATOS_LICITACIONES_EMPRESAS",engine)
    emps.set_index("empresa",inplace=True)
    return emps


def concatEmps(U,R):
    join = U.join(R)
    noNULL = join[~join['id_empresa'].isnull()]
    siNULL = join[join['id_empresa'].isnull()]
    arr0 = []
    arr1 = []
    for i in siNULL.index.tolist():
        s_ = i.split(",")[0]
        a_ = i.split(",")[1] if len(i.split(",")) > 1 else ""
	arr0.append(s_)
	arr1.append(a_)
    nDF = pd.DataFrame({ "EMPRESA": arr0, 'apellido':arr1 })
    nDF.set_index("EMPRESA",inplace=True)
    nDF_ = nDF.join(R)
    def p(x):
	newName = x.name + "," + x["apellido"] if x["apellido"] else x.name
	return newName
    nDF_.index = nDF_.apply(p,axis=1)
    nDF_noNull = nDF_[~nDF_["id_empresa"].isnull()]
    nDF_siNull = nDF_[nDF_["id_empresa"].isnull()].drop("apellido",axis=1)
    noNULL = pd.concat([noNULL,nDF_noNull],axis=1).drop("apellido",axis=1)
    sas0 = nDF_siNull[nDF_siNull.index.str.contains("S\.A\.S")].index.map(lambda x:x.split(" S.A.S.")[0]).tolist()
    sas1 = " S.A.S."
    sas = pd.DataFrame({ 'EMPRESA':sas0, 'apellido':sas1 })
    sas.set_index('EMPRESA',inplace=True)
    def p(x):
	newName = x.name + x["apellido"] if x["apellido"] else x.name
	return newName
    sas = sas.join(R)
    sas.index = sas.apply(p,axis=1)
    sas.drop("apellido",axis=1,inplace=True)
    noNULL = pd.concat([noNULL,sas],axis=1)
    nDF_siNull.drop(sas.index.tolist(),inplace=True)
    conequipos = R[R.index.str.contains("CONEQUIPOS")]
    conequipos.reset_index(inplace=True)
    conequipos["empresa"].values[0] = "INGENIER\xc3\x8dA CONSTRUCCIONES Y EQUIPOS CONEQUIPOS ING. LTDA."
    conequipos.set_index('empresa',inplace=True)
    noNULL = pd.concat([noNULL,conequipos],axis=1)
    nDF_siNull.drop("INGENIER\xc3\x8dA CONSTRUCCIONES Y EQUIPOS CONEQUIPOS ING. LTDA.",inplace=True)
    arrendadora = R[R.index.str.contains("ARRENDADORA")]
    arrendadora.reset_index(inplace=True)
    arrendadora["empresa"].values[0] = "CONSTRUCTORA Y ARRENDADORA M\xc3\x89XICO, S.A. DE C.V.";
    arrendadora.set_index("empresa",inplace=True)
    noNULL = pd.concat([noNULL,arrendadora],axis=1)
    nDF_siNull.drop("CONSTRUCTORA Y ARRENDADORA M\xc3\x89XICO, S.A. DE C.V.",inplace=True)
    return noNULL,nDF_siNull


if(__name__ == '__main__'):
    empsU = empresasUnicas()
    empsR = empresasRaw('oracle://cmde_raw:raw17@localhost:1521/XE')
    nn = concatEmps(empsU,empsR)
#    empsR.set_index("empresa",inplace=True)
#    join = empsU.join(empsR)
#    join[join['id_empresa'].isnull()].index.tolist()

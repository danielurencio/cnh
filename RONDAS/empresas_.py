import re
import pandas as pd
import numpy as np
import cx_Oracle
from sqlalchemy import create_engine
import sys

conn = "oracle://cmde_raw:raw17@localhost:1521/XE"
#conn=sys.argv[1]
f_ = pd.read_csv("base_utf8.csv")

def empresasUnicas():
    arr = []
    empsU = f_["LICITANTE"].tolist()
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
    if(conn):
        engine = create_engine(conn)
        emps = pd.read_sql("SELECT * FROM DATOS_LICITACIONES_EMPRESAS",engine)
        emps.set_index("empresa",inplace=True)
    return emps

def intermediaLics(idRecuperados):
    lics = f_.sort_values("LICITANTE")["LICITANTE"].drop_duplicates()
    lics = lics.reset_index()
    lics.drop("index",axis=1,inplace=True)
    licsU = lics["LICITANTE"].tolist()
    arr0 = []
    nombres0 = []
    for i,d in enumerate(licsU):
	arr1 = []
        nombres1 = []
	s_ = d.split(";")
	for j in s_:
            r_j = re.sub("^ ","",j)
            r_j = re.sub(" $","",r_j)
	    r_j = re.sub("ENERGY S.L.U.","ENERGY S.L.",r_j)
	    r_j = re.sub("S.A DE","S.A. DE",r_j)
	    arr1.append(int(idRecuperados.ix[r_j,:].id_empresa))
            nombres1.append(r_j)
	arr0.append(arr1)
        nombres0.append(";".join(nombres1))
    arr2 = []
    for i,d in enumerate(arr0):
      for j in d:
	arr2.append([i,j])
    arr2 = np.array(arr2)
    arr2 = pd.DataFrame({ 'ID_LICITANTE':arr2[:,0], 'ID_EMPRESA':arr2[:,1] })
    arr2["ID_LICITANTE"] += 1
    arr2 = arr2[["ID_LICITANTE","ID_EMPRESA"]]
    nombres0 = pd.DataFrame({ "LICITANTE":nombres0 })
    nombres0.index += 1
    nombres0.index.rename("ID_LICITANTE",inplace=True)
    return arr2,nombres0

def intermediaGrupos(intrLics,idRecuperados):
    emps = idRecuperados.set_index("id_empresa")["id_grupo"]
    intr = intrLics.set_index("ID_EMPRESA")
    join = intr.join(emps)
    join.index.rename("ID_EMPRESA",inplace=True)
    join.reset_index(inplace=True)
    join["id_grupo"] = join["id_grupo"].map(lambda x: int(x))
    join = join[['ID_LICITANTE','ID_EMPRESA','id_grupo']]
    join = join[["ID_LICITANTE","id_grupo"]].drop_duplicates()
    return join


def intermediaRaw(conn):
    if(conn):
        engine = create_engine(conn)
	query = "SELECT * FROM DATOS_LICITACIONES_LIC_EMP"
	lics = pd.read_sql(query,engine)
    return lics


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
    nDF_noNull = nDF_[~nDF_["id_empresa"].isnull()].drop("apellido",axis=1)
    nDF_siNull = nDF_[nDF_["id_empresa"].isnull()].drop("apellido",axis=1)
    noNULL = pd.concat([noNULL,nDF_noNull])#.drop("apellido",axis=1)
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
    noNULL = pd.concat([noNULL,sas])#,axis=1)
    nDF_siNull.drop(sas.index.tolist(),inplace=True)
    conequipos = R[R.index.str.contains("CONEQUIPOS")]
    conequipos.reset_index(inplace=True)
    conequipos["empresa"].values[0] = "INGENIER\xc3\x8dA CONSTRUCCIONES Y EQUIPOS CONEQUIPOS ING. LTDA."
    conequipos.set_index('empresa',inplace=True)
    noNULL = pd.concat([noNULL,conequipos])#,axis=1)
    nDF_siNull.drop("INGENIER\xc3\x8dA CONSTRUCCIONES Y EQUIPOS CONEQUIPOS ING. LTDA.",inplace=True)
    arrendadora = R[R.index.str.contains("ARRENDADORA")]
    arrendadora.reset_index(inplace=True)
    arrendadora["empresa"].values[0] = "CONSTRUCTORA Y ARRENDADORA M\xc3\x89XICO, S.A. DE C.V.";
    arrendadora.set_index("empresa",inplace=True)
    noNULL = pd.concat([noNULL,arrendadora])#,axis=1)
    nDF_siNull.drop("CONSTRUCTORA Y ARRENDADORA M\xc3\x89XICO, S.A. DE C.V.",inplace=True)
    nDF_siNull['id_empresa'] = [171,172,173,174,175,176]
    nDF_siNull['pais'] = [u'M\xc9XICO',u'CHINA',u'ITALIA',u'ESTADOS UNIDOS',u'MALASIA',u'M\xc9XICO']
    nDF_siNull['id_grupo'] = [19,21,41,92,116,137]
    noNULL = pd.concat([noNULL,nDF_siNull])
    return noNULL

def actualizarEmps(empsR,idRecuperados):
    a = empsR.reset_index()["id_empresa"]
    b = idRecuperados.reset_index()["id_empresa"]
    lista = a[~a.isin(b)].tolist()
    aa = empsR.reset_index()
    aa.set_index("id_empresa",inplace=True)
    aa = aa.ix[lista,:].reset_index()
    bb = idRecuperados.copy()
    bb.index.rename("empresa",inplace=True)
    bb = bb.reset_index()
    join = pd.concat([bb,aa])
    join["id_empresa"] = join["id_empresa"].map(lambda x:int(x))
    join["id_grupo"] = join["id_grupo"].map(lambda x:int(x))
    join = join[['id_empresa','empresa','pais','id_grupo']]
    return join
     

def tablaOfertas(licsU):
    lics = f_["LICITANTE"]
    nombres0 = []
    for i,d in enumerate(lics):
        nombres1 = []
	s_ = d.split(";")
	for j in s_:
            r_j = re.sub("^ ","",j)
            r_j = re.sub(" $","",r_j)
	    r_j = re.sub("ENERGY S.L.U.","ENERGY S.L.",r_j)
	    r_j = re.sub("S.A DE","S.A. DE",r_j)
            nombres1.append(r_j)
        nombres0.append(";".join(nombres1))
    tt = f_.copy()
    ll = licsU.copy().reset_index()
    ll.set_index("LICITANTE",inplace=True)
    tt["LICITANTE"] = nombres0;
    tt.set_index("LICITANTE",inplace=True)
    join = tt.join(ll)
    return join



if(__name__ == '__main__'):
    empsU = empresasUnicas()
    empsR = empresasRaw(conn)
    intrR = intermediaRaw(conn)
    idRecuperados = concatEmps(empsU,empsR)
    intrLics = intermediaLics(idRecuperados)[0]
    licsU = intermediaLics(idRecuperados)[1]
    intrGpos = intermediaGrupos(intrLics,idRecuperados)
    empresas = actualizarEmps(empsR,idRecuperados)
    ofertas = tablaOfertas(licsU)
###################### IMPORTAR ############################################
    licsU.to_csv("nt_licitantes.csv",encoding="latin1",header=None)
    intrLics.to_csv("nt_intermedia_licitantes.csv",header=None,index=False)
    intrGpos.to_csv("nt_intermedia_grupos.csv",header=None,index=False)
    empresas.to_csv("nt_empresas.csv",encoding="latin1",header=None,index=False)
    ofertas.to_csv("nt_ofertas.csv",encoding="latin1",header=True,index=False)
        

# encoding=UTF-8
import sys
reload(sys)
sys.setdefaultencoding("UTF-8")
import re
import pandas as pd
import numpy as np

class Rondas:
    def __init__(self,archivo,columna):
	self.archivo = archivo
	self.columna = columna
	self.tipo = self.Tipo()
	self.skip_rows = self.skipRows()
	self.df = self.read_excel()
        self.regex1 = [
	 (", S.A. DE C.V.|, S.A. de C.V."," S.A. de C.V."),
	 (", S.A."," S.A."),
	 ("S.A de","S.A. de"),
	 (", S. DE R.L. DE C.V.|, S. de R.L. de C.V."," S. de R.L. de C.V."),
	 ("[.]&",". &"),
	 (", L.P."," L.P."),
	 (", Ltd."," Ltd."),
	 (", Inc."," Inc."),
	 (", LLC"," LLC"),
	 (", B.V."," B.V."),
	 ("S.A.P.I de","S.A.P.I. de"),
	 ("Mitsui & Co. Ltd","Mitsui&Co. Ltd"),
	 ("Japan Oil, Gas","Japan Oil; Gas"),
	 ("Sanchez Oil & Gas","Sanchez Oil&Gas"),
	 ("PTT Exploration & ","PTT Exploration&"),
	 ("Sierra Oil & Gas","Sierra Oil&Gas"),
	 ("Upstream Delta 2","Upstream Delta 1"),
	 ("Energy LLC y Petrobal Upstream","Energy LLC & Petrobal Upstream"),
         (", Servicios Integrales & Mercado de Arenas"," & Mercado de Arenas"),
	 ("HoldingsLimited","Holdings Limited"),
("Sinopec International Petroleum Exploration & Production Corporation","Sinopec International Petroleum Exploration&Production Corporation"),
	 ("xico[.]","xico"),
	 (", ",","),
	 ("LUKOIL","Lukoil"),
	 ("ENI I","Eni I"),
#	 ("BP Exploration México","BP Exploration México S.A. de C.V.")
        ]
        self.regex2 = [
	 ("^  *",""),
	 ("S[.]A[.]de ","S.A. de "),
#	 (";",","),
#	 ("Mitsui&Co.","Mitsui & Co."),
	 ("Sanchez Oil&Gas","Sanchez Oil & Gas"),
	 ("PTT Exploration&Production PCL","PTT Exploration & Production PCL"),
	 ("Sierra Oil&Gas","Sierra Oil & Gas"),
	 (u'\xa0',""),
	 (" *$",""),
#         ("BP Exploration México","BP Exploration México S.A. de C.V.")
#	 ("xicoS","xico")
        ]

    def Tipo(self):
	tipo = self.archivo.split("_")[2].split(".")[0]
	return tipo

    def skipRows(self):
	if( self.tipo == "empresas" ):
	    return 4
	elif( self.tipo == "ofertas" ):
	    return 3
	else:
	    print("ERROR: El archivo no tiene el nombre adecuado.")

    def read_excel(self):
        df = pd.read_excel(self.archivo,skiprows=self.skip_rows)
        return df

    def separarEmpresas(self):
        empresasPulidas = []
        b = []
	df = self.df[self.columna]#self.read_excel()[self.columna]
        for consorcio in df.unique():
	    for r1 in self.regex1:
	        if( bool(re.search(r1[0],consorcio) ) ):
		    consorcio = re.sub(r1[0],r1[1],consorcio)
	    empresas = consorcio.split(",")
	    for empresa in empresas:
	        empresasPulidas.append(empresa)
        for empresaPulida in empresasPulidas:
	    conj = empresaPulida.split(" & ")
	    for j in conj:
	        for r2 in self.regex2:
		    if( bool(re.search(r2[0],j)) ):
		        j = re.sub(r2[0],r2[1],j)
	        b.append(j)
        dict = {}
        dict[self.columna] = np.array(b)
        return pd.DataFrame(dict)
#    return pd.DataFrame({ "EMPRESA":np.array(b) })


    def listaUnicos(self):
        for i,d in enumerate(self.separarEmpresas()[self.columna].unique()):
	    print i,d

    def contiene(self,string):
        c = self.separarEmpresas()
        if(string == 0):
	    print(c[self.columna].unique().shape[0])
        else:
            c = c[c[self.columna].str.contains(string) == True]
            return c[self.columna].unique()

    def paisesUnicos(self):
	if( self.tipo == "empresas" ):
	    pp = self.df["COUNTRY"].map(lambda x: x.split("/")).values.tolist()
	    pp_lista = [ item for sublist in pp for item in sublist]
	    pp_set = set(pp_lista)
	    pp_unicos = list(pp_set)
	    return pp_unicos

    def paises2(self):
	if( self.tipo == "empresas" ):
	    arr1 = []
	    arr2 = []
	    arr3 = []
	    paises = self.df["COUNTRY"].map(lambda x: x.split("/"))\
		.values.tolist()
	    licitantes= self.df["EMPRESA"]
	    for consorcio in licitantes:
		for r1 in self.regex1:
		    if( bool(re.search(r1[0],consorcio)) ):
			consorcio = re.sub(r1[0],r1[1],consorcio)
		consorcio = consorcio.split(",")
		arr1.append(consorcio)
            for i,lic in enumerate(arr1):
		for i,emp in enumerate(lic):
		    cond = bool( re.search(" & ",emp) )
		    if(cond):
			separacion = emp.split(" & ")
			del lic[i]
			for k in separacion:
			    lic.append(k)
		for r2 in self.regex2:
		    lic = [ re.sub(r2[0],r2[1],i) for i in lic ]
		arr2.append(lic);
	    for i,d in enumerate(paises):
		if( len(paises[i]) == len(arr2[i]) ):
		    arr3.append(zip(arr2[i],paises[i]))
	    return [arr2,arr3]
	else:
	    print "El archivo no es el el de empresas."

    def dictPaises(self):
        arr = []
        arr2 = []
        paises = self.paisesUnicos()
        empYpais = self.paises2()[1]
        dic = {}
        for pais in paises:
            dic[str(pais)] = []
        for tuplos in empYpais:
	    for tuplo in tuplos:
	        arr.append(tuplo)
        arr = list(set(arr))
        for i in arr:
            for key in dic.keys():
	        if(i[1] == key):
		    dic[key].append(i[0])
        for k in dic.keys():
            for e in dic[k]:
	        arr2.append([e,k])
        arr2 = np.array(arr2)
        df = pd.DataFrame({ "EMPRESA":arr2[:,0], "PAIS":arr2[:,1] })
	df = df.sort_values("EMPRESA",ascending=1)
	df = df.reset_index()
	df.drop("index",axis=1,inplace=True)
	return df

    def importarEmpresas(self):
	df = self.dictPaises()
	df.to_csv("RONDAS_" + self.tipo + ".csv",encoding="UTF-8", header=None, sep=";")
	print("Archivo de empresas exportado.")

    def importarLicitantes(self):
	if(self.tipo == 'ofertas'):
	  df = self.df
	  df = df.fillna(0)
#	  df["MODALIDAD"] = df["MODALIDAD"]\
#		.map(lambda x: 1 if x == "Individual" else 2)
#	  df["CONTRATO"] = df["CONTRATO"]\
#		.map(lambda x: 1 if x == "Licencia" else 2)
	  df.to_csv("RONDAS_"+self.tipo+".csv",encoding="UTF-8",header=None,sep=';')
	  print("Archivo de licitantes exportado.")
	else:
	  print("No se cargó el archivo correcto.")

    def join_table(self):
	if( self.tipo == "ofertas" ):
	    arr1 = []
	    arr2 = []
	    arr3 = []
#	    paises = self.df["COUNTRY"].map(lambda x: x.split("/"))\
#		.values.tolist()
	    licitantes= self.df["EMPRESA"]
	    for consorcio in licitantes:
		for r1 in self.regex1:
		    if( bool(re.search(r1[0],consorcio)) ):
			consorcio = re.sub(r1[0],r1[1],consorcio)
		consorcio = consorcio.split(",")
		arr1.append(consorcio)
            for i,lic in enumerate(arr1):
		for i,emp in enumerate(lic):
		    cond = bool( re.search(" & ",emp) )
		    if(cond):
			separacion = emp.split(" & ")
			del lic[i]
			for k in separacion:
			    lic.append(k)
		for r2 in self.regex2:
		    lic = [ re.sub(r2[0],r2[1],i) for i in lic ]
		arr2.append(lic);
#	    return arr2
	    indices = []
#	    b = self.dictPaises()
	    for i,l in enumerate(arr2):
		for e in l:
	#	  print e
		  if(e!="CNOOC International Limited"):
		    ind = b[b['EMPRESA'] == e].index[0]
		    #print ind
		    indices.append( (i,ind) )
	    indices = np.array(indices)
	    dic = { "id_licitantes":indices[:,0], "id_empresas":indices[:,1] }
	    df = pd.DataFrame(dic)
	    df = df[["id_licitantes","id_empresas"]]
#	    return df 
	    df.to_csv("tabla_intermedia.csv",encoding="UTF-8",index=0,header=None)
	    print("Archivo de tabla intermedia creado.")


def importar():
   b.to_csv("RONDAS_empresas.csv",header=None,sep=";",encoding="latin1")
   a.to_csv("RONDAS_licitantes.csv",header=None,sep=";",encoding="latin1")
   print("ARCHIVOS IMPORTADOS")


def buscar(string):
    dd = b[b["EMPRESA"].str.contains(string) == 1]
    print dd

def idLIC():
    emps = empresas.df["EMPRESA"].map(lambda x: x.upper())
    E = pd.DataFrame({ "EMPRESA":emps, "ID":np.full([emps.shape[0],],"na") })
    for i in range(E.shape[0]):
      for j in range(a.shape[0]):
	if( E.loc[i]["EMPRESA"] == a.loc[j]["EMPRESA"] ):
	  E.ix[i,"ID"] = int(j)
    sobran = E[E["ID"] == "na"]
    noPrecalif = empresas.df[empresas.df["PREQUAL"] == "No Precalifica"]["EMPRESA"].drop_duplicates().map(lambda x: x.upper())
    for i in sobran.index:
	if( sobran.ix[i,"EMPRESA"] in noPrecalif.tolist() ):
	    E.ix[i,"ID"] = "NP"
    return E


def regexIDs(var,columna):
    emps = var.df["EMPRESA"].map(lambda x: x.upper())#.drop_duplicates()\
#	.sort_values().reset_index().drop("index",axis=1)
    emps = pd.DataFrame({ "EMPRESA":emps })
    for i,d in enumerate(emps.ix[:,0]):
      for r in empresas.regex1:
	if( bool(re.search(r[0].upper(),d) ) ):
	  emps.ix[i,0] = re.sub(r[0].upper(),r[1].upper(),d)
    for i,d in enumerate(emps.ix[:,0]):
      for r in empresas.regex2:
	if ( bool(re.search(r[0].upper(),d)) ):
	  emps.ix[i,0] = re.sub(r[0].upper(),r[1].upper(),d)
#    return pd.DataFrame({"EMPRESA":emps.values})
    emps[columna] = emps[columna].map(lambda x: re.sub(",S[.]A"," S.A",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(", S[.]A[.]"," S.A.",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(",S[.] DE R"," S. DE R",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(",L[.]P"," L.P",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(", L[.]P"," L.P",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(",B[.]V"," B.V",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(" ,",",",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(", ",",",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("II,LL","II LL",x)) 
    emps[columna] = emps[columna].map(lambda x: re.sub("OIL,GAS","OIL; GAS",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("CO[.],LTD","CO. LTD",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("WORLDWIDE,INC[.]","WORLDWIDE INC.",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("OIL & GAS","OIL&GAS",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(" \xa0","",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("\xa0","",x)) 
    emps[columna] = emps[columna].map(lambda x: re.sub("HOLDINGS,LLC","HOLDINGS LLC",x))
    emps[columna] = emps[columna].map(lambda x: re.sub(" & ",",",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("V[.]& ","V.,",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("S[.]A[.]P[.]I ","S.A.P.I. ",x))
    emps[columna] = emps[columna].map(lambda x: re.sub("S[.]A D","S.A. D",x))
    return emps
    

def empresasNT():
    arr = []
    ee = empresas.df;
    ee["EMPRESA"] = emps["EMPRESA"]
    inxs = emps["EMPRESA"].drop_duplicates().sort_values().reset_index().drop("index",axis=1)
    ee["ID_LICITANTE"] = np.zeros(ee.shape[0])
    for i,d in enumerate(inxs.ix[:,"EMPRESA"]):
	indices = ee[ee["EMPRESA"] == inxs["EMPRESA"][i]].index.tolist()
	arr.append((indices,i))
	for j in indices:
	    ee.ix[j,"ID_LICITANTE"] = i
    ee["ID_LICITANTE"] = ee["ID_LICITANTE"].map(lambda x: int(x))
    ee.drop(["WIN"],axis=1,inplace=True)
    for i in ["MOD","PREQUAL","PROP"]:
	ee[i] = ee[i].fillna("PENDIENTE")
	ee[i] = ee[i].map(lambda x: x.upper())
    ee["DATA_ROOM"] = ee["DATA_ROOM"]\
	.map(lambda x: 0 if "No Accede al Cuarto de Datos" else 1)
    return ee
    

if(__name__ == "__main__"):
    empresas = Rondas("DATOS_RONDAS_empresas.xlsx","EMPRESA")
    b = empresas.dictPaises()
    b["EMPRESA"] = b["EMPRESA"].map(lambda x: x.upper())
    b["PAIS"] = b["PAIS"].map(lambda x: x.upper())
    b.drop_duplicates("EMPRESA",inplace=True)
    b.reset_index(inplace=True)
    b.drop("index",axis=1,inplace=True)
    b["EMPRESA"] = b["EMPRESA"].map(lambda x: re.sub(" & ","&",x))
    licitantes = Rondas("DATOS_RONDAS_ofertas.xlsx","EMPRESA")
    a = licitantes.df[["EMPRESA","OPERADOR"]]
    a = a.sort_values("EMPRESA",ascending=False)
    a = a.fillna("PENDIENTE")
    a["EMPRESA"] = a["EMPRESA"].map(lambda x: x.upper())
    a["OPERADOR"] = a["OPERADOR"].map(lambda x: x.upper())
    a.sort_values("EMPRESA",ascending=1, inplace=True)
    a.drop_duplicates("EMPRESA", inplace=True)
    a.reset_index(inplace=True);
    a.drop("index",axis=1,inplace=True)
#    LIC = licitantes.df["EMPRESA"].map(lambda x: x.upper()).unique()
#    LIC = pd.DataFrame({ "LICITANTES": LIC })
    emps = regexIDs(empresas,"EMPRESA")
    lics = regexIDs(licitantes,"EMPRESA")

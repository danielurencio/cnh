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
	 (";",","),
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




def test_JOIN():
    indices = []
    for i,l in enumerate(a):
        for e in l:
#	  print e
	  if(e!="CNOOC International Limited"):
            ind = b[b['EMPRESA'] == e].index[0]
	    #print ind
            indices.append( (i,ind) )    
    return np.array(indices)


if(__name__ == "__main__"):
    empresas = Rondas("DATOS_RONDAS_empresas.xlsx","EMPRESA")
    b = empresas.dictPaises()
    licitantes = Rondas("DATOS_RONDAS_ofertas.xlsx","EMPRESA")
    

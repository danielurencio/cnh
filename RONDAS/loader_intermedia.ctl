load data
  infile 'empresas_licitantes.csv'
  into table DATOS_EMPRESAS_LICITANTES
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

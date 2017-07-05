load data
  infile 'tabla_intermedia.csv'
  into table DATOS_EMPRESAS_LICITANTES
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

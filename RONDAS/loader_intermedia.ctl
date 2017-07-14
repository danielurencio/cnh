load data
  infile 'DATOS_LICITACIONES_licitantes_empresas.csv'
  into table DATOS_LICITACIONES_LICITANTES_EMPRESAS
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

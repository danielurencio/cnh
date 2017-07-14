load data
  infile 'DATOS_LICITACIONES_empresas.csv'
  into table DATOS_LICITACIONES_EMPRESAS
  fields terminated by ',' optionally enclosed by '"'
  (ID_EMPRESA,EMPRESA,PAIS)

load data
  infile 'nt_empresas.csv'
  into table DATOS_LICITACIONES_EMPRESAS
  fields terminated by ',' optionally enclosed by '"'
  (ID_EMPRESA,EMPRESA,PAIS,ID_GRUPO)

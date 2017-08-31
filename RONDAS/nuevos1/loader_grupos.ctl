load data
  infile 'DATOS_LICITACIONES_grupos_empresariales.csv'
  into table DATOS_LICITACIONES_MATRICES
  fields terminated by ',' optionally enclosed by '"'
  (ID_MATRIZ,MATRIZ)

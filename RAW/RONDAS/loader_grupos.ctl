load data
  infile 'DATOS_LICITACIONES_grupos_empresariales.csv'
  into table DATOS_LICITACIONES_GRUPOS
  fields terminated by ',' optionally enclosed by '"'
  (ID_GRUPO,GRUPO)

load data
  infile 'DATOS_LICITACIONES_licitantes.csv'
  into table DATOS_LICITACIONES_LICITANTES
  fields terminated by ',' optionally enclosed by '"'
  (ID_LICITANTE,LICITANTE,MODALIDAD)

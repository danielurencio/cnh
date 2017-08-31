load data
  infile 'nt_licitantes.csv'
  into table DATOS_LICITACIONES_LICITANTES1
  fields terminated by ',' optionally enclosed by '"'
  (ID_LICITANTE,LICITANTE)

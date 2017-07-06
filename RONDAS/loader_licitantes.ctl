load data
  infile 'RONDAS_licitantes.csv'
  into table DATOS_LICITACIONES_LICITANTES
  fields terminated by ";"
  (ID_LICITANTE,LICITANTE)

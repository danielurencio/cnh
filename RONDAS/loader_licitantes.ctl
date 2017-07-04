load data
  infile 'RONDAS_licitantes.csv'
  into table RONDAS_LICITANTES
  fields terminated by ","
  (ID_LICITANTE,LICITANTE,OPERADOR)

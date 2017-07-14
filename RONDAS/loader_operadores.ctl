load data
  infile 'DATOS_LICITACIONES_operadores.csv'
  into table DATOS_LICITACIONES_OPERADORES
  fields terminated by ',' optionally enclosed by '"'
  (ID_OPERADOR,OPERADOR)

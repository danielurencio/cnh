load data
  infile 'operadores.csv'
  into table DATOS_LICITACIONES_OPERADORES
  fields terminated by ","
  (ID_OPERADOR,OPERADOR)

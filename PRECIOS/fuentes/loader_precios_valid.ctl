load data
  infile 'precios.csv'
  into table DATOS_PRECIOS
  fields terminated by ","
  (FECHA DATE "yyyy-mm-dd",BRENT,WTI,MME,HENRY_HUB,INSERTADO DATE "yyyy-mm-dd",FUENTES)

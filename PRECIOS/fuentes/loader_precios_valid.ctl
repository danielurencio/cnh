load data
  infile 'precios.csv'
  into table DATOS_PRECIOS
  fields terminated by ","
  (FECHA DATE "yyyy-mm-dd",WTI,BRENT,HENRY_HUB,MME,INSERTADO DATE "yyyy-mm-dd",FUENTES)

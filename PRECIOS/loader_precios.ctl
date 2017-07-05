load data
  infile 'precios.csv'
  into table DATOS_PRECIOS
  fields terminated by ","
  (FECHA DATE "mm/dd/yyyy",BRENT,WTI,MME,HENRY_HUB)

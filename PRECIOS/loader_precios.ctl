load data
  infile 'precios.csv'
  into table PRECIOS
  fields terminated by ","
  (FECHA DATE "mm/dd/yyyy",BRENT,WTI,MME,HENRY_HUB)

load data
  infile 'precios.csv'
  into table DATOS_PRECIOS
  fields terminated by ","
  (FECHA DATE "mm/dd/yyyy",WTI,BRENT,HENRY_HUB_MME)

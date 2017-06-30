load data
  infile 'crudo_por_estado.csv'
  into table DATOS_BDI_CRUDO_POR_ESTADO
  fields terminated by ","
(FECHA DATE "yyyy/mm/dd",E,ESTADO,MBD)

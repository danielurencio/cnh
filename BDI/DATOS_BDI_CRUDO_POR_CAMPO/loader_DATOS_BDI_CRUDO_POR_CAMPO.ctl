load data
  infile 'produccion_por_campo.csv'
  into table DATOS_BDI_CRUDO_POR_CAMPO
  fields terminated by ","
(FECHA DATE "yyyy/mm/dd",E,REGION,ACTIVO,CAMPO,MBD)

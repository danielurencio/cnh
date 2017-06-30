load data
  infile 'pozos_perforacion.csv'
  into table DATOS_BDI_POZOS_DESARROLLO_PE
  fields terminated by ","
(FECHA DATE "yyyy/mm/dd",E,REGION,ACTIVO,NUM_POZOS)

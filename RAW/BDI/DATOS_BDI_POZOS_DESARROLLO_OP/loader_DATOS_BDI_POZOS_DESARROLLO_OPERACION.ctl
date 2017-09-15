load data
  infile 'pozos_operacion.csv'
  into table DATOS_BDI_POZOS_DESARROLLO_OP
  fields terminated by ","
(FECHA DATE "yyyy/mm/dd",E,TIPO_PRODUCTOR,REGION,ACTIVO,CAMPO,NUM_POZOS)

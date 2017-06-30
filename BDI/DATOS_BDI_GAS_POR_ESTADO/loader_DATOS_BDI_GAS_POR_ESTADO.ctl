load data
  infile 'gas_por_estado.csv'
  into table DATOS_BDI_GAS_POR_ESTADO
  fields terminated by ","
(FECHA DATE "yyyy/mm/dd",E,TIPO_GAS,ESTADO,MMPCD)

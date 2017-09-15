load data
  infile 'proyectos.csv'
  into table DATOS_BDI_CRUDO_POR_PROYECTO
  fields terminated by ","
(FECHA DATE "yyyy/mm/dd",E,REGION,ACTIVO,PROYECTO,CAMPO,MMBD)

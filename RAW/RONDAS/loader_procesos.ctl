load data
  infile 'procesos.csv'
  into table DATOS_LICITACIONES_PROCESOS
  fields terminated by ","
  TRAILING NULLCOLS
  (ID_LICITANTE,ID_EMPRESA,RONDA,LICITACION,DATA_ROOM,PRECALIF)

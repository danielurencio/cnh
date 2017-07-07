load data
  infile 'RONDAS_procesos_de_licitacion.csv'
  into table DATOS_LICITACIONES_PROCESOS
  fields terminated by ","
  TRAILING NULLCOLS
  (ID_LICITANTE,ID_RONDA,RONDA,LIC,DATA_ROOM,PREQUAL)

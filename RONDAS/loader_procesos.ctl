load data
  infile 'RONDAS_procesos_de_licitacion.csv'
  into table DATOS_LICITACIONES_PROCESOS
  fields terminated by ","
  (ID_LICITANTE,MOD,ID_R,RONDA,LIC,DATA_ROOM,PREQUAL,PROP)

load data
  infile 'tabla_intermedia.csv'
  into table RONDAS_INTERMEDIA
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

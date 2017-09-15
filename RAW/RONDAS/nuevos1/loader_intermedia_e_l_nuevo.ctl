load data
  infile 'nt_intermedia_licitantes.csv'
  into table DATOS_LICITACIONES_LIC_EMP1
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

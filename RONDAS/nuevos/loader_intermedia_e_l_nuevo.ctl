load data
  infile 'nt_intermedia_licitantes.csv'
  into table DATOS_LICITACIONES_LIC_EMP
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

load data
  infile 'nt_intermedia_grupos.csv'
  into table DATOS_LICITACIONES_LIC_MAT
  fields terminated by ","
  (ID_LICITANTE,ID_MATRIZ)

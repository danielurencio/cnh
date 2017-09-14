load data
  infile 'lic_mat.csv'
  into table DATOS_LICITACIONES_LIC_MAT
  fields terminated by ","
  (ID_LICITANTE,ID_MATRIZ)

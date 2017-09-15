load data
  infile 'matrices_paises.csv'
  into table DATOS_LICITACIONES_MATRICES
  fields terminated by ',' optionally enclosed by '"'
  (ID_MATRIZ,MATRIZ,PAIS)

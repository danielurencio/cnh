load data
  infile 'RONDAS_empresas.csv'
  into table RONDAS_EMPRESAS
  fields terminated by ","
  (ID_EMPRESA,EMPRESA,PAIS)

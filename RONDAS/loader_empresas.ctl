load data
  infile 'RONDAS_empresas.csv'
  into table DATOS_LICITACIONES_EMPRESAS
  fields terminated by ","
  (ID_EMPRESA,EMPRESA,PAIS)

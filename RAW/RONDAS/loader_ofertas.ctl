load data
  infile 'DATOS_LICITACIONES_ofertas.csv'
  into table DATOS_LICITACIONES_OFERTAS
  fields terminated by ","
  TRAILING NULLCOLS
  (ID_LICITANTE_OFERTA,ID_BLOQUE,VAR_ADJ1,VAR_ADJ2,VPO,BONO,ID_OPERADOR,GANADOR,SEGUNDO_LUGAR,ID_ADJ,ID_LICITANTE_ADJ)

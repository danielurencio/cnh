load data
  infile 'DATOS_LICITACIONES_bloques_nuevo_ids.csv'
  into table DATOS_LICITACIONES_BLOQUES1
  fields terminated by ',' optionally enclosed by '"'
  TRAILING NULLCOLS

  (
  ID_BLOQUE1,
  NOMBRE_BLOQUE,
  NUM_BLOQUE,
  PROV_GEO,
  CUENCA,
  ESTADO,
  SUPERFICIE,
  UBICACION,
  RONDA,
  LICITACION,
  PLAYS,
  LITOLOGIA,
  COB_SIS,
  HCBRO,
  API,
  TIRANTE_PROM,
  TIRANTE_MAX,
  TIRANTE_MIN,
  PROF_PROM,
  CAMPOS,
  ID_LICITANTE_ADJ,
  ID_OPERADOR,
  INV_USD
  )

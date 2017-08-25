load data
  infile 'DATOS_LICITACIONES_bloques_nuevo.csv'
  into table DATOS_LICITACIONES_BLOQUES
  fields terminated by ',' optionally enclosed by '"'
  TRAILING NULLCOLS

  (
  ID_BLOQUE,
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
  CAMPOS
  )

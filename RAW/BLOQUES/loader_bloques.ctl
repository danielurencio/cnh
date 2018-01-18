load data
  infile 'BLOQUES_BIEN.csv'
  into TABLE DATOS_LICITACIONES_BLOQUES1
  fields terminated by ',' optionally enclosed by '"'
  TRAILING NULLCOLS
  (
  ID_BLOQUE,
  ID_LICITACION,
  RONDA,
  LICITACION,
  NUM_BLOQUE,
  NOMBRE_BLOQUE,
  CONTRATO,
  UBICACION,
  ADJUDICADO,
  SUPERFICIE,
  ENTIDAD,
  POZOS_COMPROMETIDOS,
  ENTIDAD_PRINCIPAL,
  PROV_GEO,
  CUENCA,
  ID_CONTRATO,
  TIPO_ACTIVIDAD,
  HIDROC_PRINCIPAL,
  TIPO_HIDROCARBURO,
  HIDROCARBUROS,
  LITOLOGIA,
  PLAYS,
  COB_SIS_3D,
  CAMPOS,
  GRADOS_API,
  TIRANTE_PROM,
  TIRANTE_MAX,
  TIRANTE_MIN,
  PROF_PROM,
  REC_PROSP_P10,
  REC_PROSP_P50,
  REC_PROSP_P90,
  REC_PROSP_MEDIO,
  REC_PROSP_AD_RIESGO,
  REC_PROSP_TOT_RIESGO,
  PROB_EXITO_GEO_MAX,
  PROB_EXITO_GEO_MIN,
  PROB_EXITO_COM_MAX,
  PROB_EXITO_COM_MIN,
  RESV_ACEITE_1P,
  RESV_ACEITE_2P,
  RESV_ACEITE_3P,
  RESV_GAS_1P,
  RESV_GAS_2P,
  RESV_GAS_3P,
  RESV_PCE_1P,
  RESV_PCE_2P,
  RESV_PCE_3P,
  VOL_ORIG_ACEITE_1P,
  VOL_ORIG_ACEITE_2P,
  VOL_ORIG_ACEITE_3P,
  VOL_ORIG_GAS_1P,
  VOL_ORIG_GAS_2P,
  VOL_ORIG_GAS_3P,
  VOL_ORIG_PCE_1P,
  VOL_ORIG_PCE_2P,
  VOL_ORIG_PCE_3P,
  PROD_ACUM_ACEITE,
  PROD_ACUM_GAS,
  PROD_ACUM_PCE,
  VOL_ORIG_REM_ACEITE_1P,
  VOL_ORIG_REM_ACEITE_2P,
  VOL_ORIG_REM_ACEITE_3P,
  VOL_ORIG_REM_GAS_1P,
  VOL_ORIG_REM_GAS_2P,
  VOL_ORIG_REM_GAS_3P,
  VOL_ORIG_REM_PCE_1P,
  VOL_ORIG_REM_PCE_2P,
  VOL_ORIG_REM_PCE_3P,
  INV_USD,
  ID_LICITANTE_ADJ,
  ID_OPERADOR
  )
load data
  infile 'DATOS_LICITACIONES_bloques.csv'
  into table DATOS_LICITACIONES_BLOQUES
  fields terminated by ',' optionally enclosed by '"'
  TRAILING NULLCOLS
  (ID_BLOQUE,RONDA,LICITACION,NOM_BLOQUE,NUM_BLOQUE,P_GEOLOGICA,P_PETROLERA_CUENCA,ESTADO,AREA,UBICACION,PLAYS_YACIMIENTO,LITOLOGIA,SISIMICA_3D,HIDRO_PRINCIPAL,GRADOS_API,T_AGUA_P,T_AGUA_MAX,T_AGUA_MIN,P_CAMPO,CAMPOS_AREA,CONTRATO,PMT_TOTAL,PMT_PERFORACION,PMT_ESTUDIOS_SIS,NUM_PEXP,NUM_PDEL,NUM_PRUEBAS_P,PMT_EXPLORACION,PMT_EVALUACION,PMT_ACTIVIDADES,VOL_RECUPERABLE,PROD_ALCANZABLE,C_PROD_ALCANZABLE,PROD_CRUDO_ALCANZABLE,PROD_GAS_ALCANZABLE,PROD_P_ANUAL,PROD_P_ANUAL_CRUDO,PROD_P_ANUAL_GAS,GASTOS_OPERATIVOS,GASTO_OP_FIJO,COSTO_ABANDONO,INV_TOTAL,INV_EXPLORATORIA,INV_DESARROLLO,INV_3_ANIOS,PINV_3_ANIOS,INV_5_ANIOS,PINV_5_ANIOS,COSTO_BARRIL,PROS_IDENS,RP_P10,RP_P50,RP_P90,RP_MEDIO,RP_ADICIONAL_R,RP_TOTAL_R,P_EXITO_GEO_MAX,P_EXITO_GEO_MIN,P_EXITO_COM_MAX,P_EXITO_COM_MIN,VOL_ORIGINAL,VOL_ORIGINAL_ACEITE,VOL_ORIGINAL_GAS,RESERVAS_1P,RESERVAS_2P,RESERVAS_3P,CRUDO_1P,CRUDO_2P,CRUDO_3P,GAS_1P,GAS_2P,GAS_3P)

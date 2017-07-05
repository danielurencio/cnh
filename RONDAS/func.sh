##########################################################
########## LICITANTES ###################################
########################################################

CreateLICITANTES() {
  cat schema_licitantes.txt | sqlplus cmde_raw/raw17
}

TruncateLICITANTES() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_LICITANTES;" | sqlplus cmde_raw/raw17
}

LoadLICITANTES() {
  sqlldr cmde_raw/raw17 control=loader_licitantes.ctl
}


##########################################################
########## EMPRESAS #####################################
########################################################


CreateEMPRESAS() {
  cat schema_empresas.txt | sqlplus cmde_raw/raw17
}

TruncateEMPRESAS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_EMPRESAS;" | sqlplus cmde_raw/raw17
}

LoadEMPRESAS() {
  sqlldr cmde_raw/raw17 control=loader_empresas.ctl
}


##########################################################
########## INTERMEDIA ###################################
########################################################


CreateINTERMEDIA() {
  cat schema_intermedia.txt | sqlplus cmde_raw/raw17
}

TruncateINTERMEDIA() {
  echo "TRUNCATE TABLE DATOS_EMPRESAS_LICITANTES;" | sqlplus cmde_raw/raw17
}

LoadINTERMEDIA() {
  sqlldr cmde_raw/raw17 control=loader_intermedia.ctl
}


BorrarLogBad() {
  rm *.bad *.log
}

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


##########################################################
########## OPERADORES ###################################
########################################################


CreateOPERADORES() {
  cat schema_operadores.txt | sqlplus cmde_raw/raw17
}

TruncateOPERADORES() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_OPERADORES;" | sqlplus cmde_raw/raw17
}

LoadOPERADORES() {
  iconv -f latin1 -t UTF-8 operadores.csv > operadores1.csv
  rm operadores.csv
  sed -i 's/é/É/g' operadores1.csv
  sed -i 's/ó/Ó/g' operadores1.csv
  sed -i 's/í/Í/g' operadores1.csv
  iconv -f UTF-8 -t latin1 operadores1.csv > operadores.csv
  rm operadores1.csv
  sqlldr cmde_raw/raw17 control=loader_operadores.ctl
}


##########################################################
########## OFERTAS ######################################
########################################################


CreateOFERTAS() {
  cat schema_ofertas.txt | sqlplus cmde_raw/raw17
}

TruncateOFERTAS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_OFERTAS;" | sqlplus cmde_raw/raw17
}

LoadOFERTAS() {
  iconv -f latin1 -t utf-8 RONDAS_ofertas.csv > ofertas.csv
  rm RONDAS_ofertas.csv
  sed -i 's/á/Á/g' ofertas.csv
  sed -i 's/é/É/g' ofertas.csv
  sed -i 's/í/Í/g' ofertas.csv
  sed -i 's/ó/Ó/g' ofertas.csv
  sed -i 's/ú/Ú/g' ofertas.csv
  iconv -f utf-8 -t latin1 ofertas.csv > RONDAS_ofertas.csv
  rm ofertas.csv
  sqlldr cmde_raw/raw17 control=loader_ofertas.ctl
}


##########################################################
########## PROCESOS #####################################
########################################################


CreatePROCESOS() {
  cat schema_procesos.txt | sqlplus cmde_raw/raw17
}

TruncatePROCESOS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_PROCESOS;" | sqlplus cmde_raw/raw17
}

LoadPROCESOS() {
  sqlldr cmde_raw/raw17 control=loader_procesos.ctl
}


CrearTODO() {
  for i in LICITANTES EMPRESAS INTERMEDIA OPERADORES OFERTAS PROCESOS; do
    echo $i
    Create${i};
    echo ""
    echo ""
  done
}


DropTODO() {
  for i in EMPRESAS_LICITANTES LICITACIONES_PROCESOS LICITACIONES_OFERTAS LICITACIONES_LICITANTES LICITACIONES_EMPRESAS LICITACIONES_OPERADORES; do
    echo $i
    echo "DROP TABLE DATOS_$i;" | sqlplus cmde_raw/raw17
    echo ""
    echo ""
  done
}


PrintTABLAS() {
  echo "select table_name from user_tables;" | sqlplus cmde_raw/raw17
}

BorrarLogBad() {
  rm *.bad *.log
}

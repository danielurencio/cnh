#CITANTES ###################################
########################################################

CreatePRECIOS() {
  cat schema_precios.txt | sqlplus cmde_raw/raw17
}

TruncatePRECIOS() {
  echo "TRUNCATE TABLE PRECIOS;" | sqlplus cmde_raw/raw17
}

LoadPRECIOS() {
  sqlldr cmde_raw/raw17 control=loader_precios.ctl
}


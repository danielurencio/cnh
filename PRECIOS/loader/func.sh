#CITANTES ###################################
########################################################

CreatePRECIOS() {
  cat schema_precios.txt | sqlplus $1
}

TruncatePRECIOS() {
  echo "TRUNCATE TABLE DATOS_PRECIOS;" | sqlplus $1
}

LoadPRECIOS() {
  sqlldr $1 control=loader_precios.ctl
}

DropPRECIOS() {
 echo "DROP TABLE DATOS_PRECIOS;" | sqlplus $1
}

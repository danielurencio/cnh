GetFile() {
  echo "Corriendo script en Python para obtener tabla."
  python file.py;
  echo "Sustityendo valores vacíos en la última columna por ceros."
  sed -i "s/,$/,0/g" gas_por_estado.csv;
}

CreateTable() {
  cat schema_DATOS_BDI_GAS_POR_ESTADO.txt | sqlplus cmde_raw/raw17;
}

DropTable() {
  echo "DROP TABLE DATOS_BDI_GAS_POR_ESTADO;" | sqlplus cmde_raw/raw17;
}

TruncateTable() {
  echo "TRUNCATE TABLE DATOS_BDI_GAS_POR_ESTADO;" | sqlplus cmde_raw/raw17;
}

LoadData() {
  sqlldr cmde_raw/raw17 control=loader_DATOS_BDI_GAS_POR_ESTADO.ctl;
}

BorrarCosas() {
  rm *.log *.bad;
}

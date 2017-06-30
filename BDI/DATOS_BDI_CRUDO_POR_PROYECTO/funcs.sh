GetFile() {
  echo "Corriendo script en Python para obtener tabla."
  python cargar_bdi_produccion.py;
  echo "Sustityendo valores vacíos en la última columna por ceros."
  sed -i "s/,$/,0/g" proyectos.csv;
}

CreateTable() {
  cat schema_DATOS_BDI_CRUDO_POR_PROYECTO.txt | sqlplus cmde_raw/raw17;
}

DropTable() {
  echo "DROP TABLE DATOS_BDI_CRUDO_POR_PROYECTO;" | sqlplus cmde_raw/raw17;
}

TruncateTable() {
  echo "TRUNCATE TABLE DATOS_BDI_CRUDO_POR_PROYECTO;" | sqlplus cmde_raw/raw17;
}

LoadData() {
  sqlldr cmde_raw/raw17 control=loader_DATOS_BDI_CRUDO_POR_PROYECTO.ctl;
}

BorrarCosas() {
  rm *.log *.bad;
}

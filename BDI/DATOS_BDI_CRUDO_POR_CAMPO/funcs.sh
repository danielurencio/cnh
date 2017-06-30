GetFile() {
  echo "Corriendo script en Python para obtener tabla."
  python cargar_bdi_produccion_campos.py;
  echo "¿No hay modificaciones para el archivo generado?"
}

CreateTable() {
  cat schema_DATOS_BDI_CRUDO_POR_CAMPO.txt | sqlplus cmde_raw/raw17;
}

DropTable() {
  echo "DROP TABLE DATOS_BDI_CRUDO_POR_CAMPO;" | sqlplus cmde_raw/raw17;
}

TruncateTable() {
  echo "TRUNCATE TABLE DATOS_BDI_CRUDO_POR_CAMPO;" | sqlplus cmde_raw/raw17;
}

LoadData() {
  sqlldr cmde_raw/raw17 control=loader_DATOS_BDI_CRUDO_POR_CAMPO.ctl;
}

BorrarCosas() {
  rm *.log *.bad;
}

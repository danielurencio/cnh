GetFile() {
  echo "Corriendo script en Python para obtener tabla."
  python cargar_bdi_pozos_desarrollo_perforacion.py;
  echo "¿No hay modificaciones para el archivo generado?"
}

CreateTable() {
  cat schema_DATOS_BDI_POZOS_DESARROLLO_PERFORACION.txt | sqlplus cmde_raw/raw17;
}

DropTable() {
  echo "DROP TABLE DATOS_BDI_POZOS_DESARROLLO_PE;" | sqlplus cmde_raw/raw17;
}

TruncateTable() {
  echo "TRUNCATE TABLE DATOS_BDI_POZOS_DESARROLLO_PE;" | sqlplus cmde_raw/raw17;
}

LoadData() {
  sqlldr cmde_raw/raw17 control=loader_DATOS_BDI_POZOS_DESARROLLO_PERFORACION.ctl;
}

BorrarCosas() {
  rm *.log *.bad;
}

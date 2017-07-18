##############################################################
## GENERAR ARCHIVOS Y PREPROCESAMIENTO ADICIONAL
############################################################
##########################################################
archivos() {
  python -c 'execfile("empresas.py"); importar();'
  python -c 'execfile("bloques.py"); importar();'

  sep=":"
#  for i in *.csv; do
#    sed -i "s/ S[.]A/$sep S.A/g" $i
#    sed -i "s/ S[.] DE R/$sep S. DE R/g" $i
#    sed -i "s/ L[.]P/$sep L.P/g" $i
#    sed -i "s/ S[.]L/$sep S.L/g" $i
#    sed -i "s/ B[.]V/$sep B.V/g" $i
#    sed -i "s/II LL/II$sep LL/g" $i
#    sed -i "s/OIL[;] GAS/OIL, GAS/g" $i
#    sed -i "s/CO[.] LTD/CO.$sep LTD/g" $i
#    sed -i "s/WORLDWIDE INC/WORLDWIDE$sep INC/g" $i
#    sed -i "s/OIL[&]GAS/OIL \& GAS/g" $i
#    sed -i "s/HOLDINGS LLC/HOLDINGS$sep LLC/g" $i
#  done

  for i in *.csv; do
    file=${i%.*}
    iconv -f latin1 -t UTF-8 $i > ${file}_1.csv
    rm $i
    sed -i "s/á/Á/g" ${file}_1.csv
    sed -i "s/é/É/g" ${file}_1.csv
    sed -i "s/í/Í/g" ${file}_1.csv
    sed -i "s/ó/Ó/g" ${file}_1.csv
    sed -i "s/ú/Ú/g" ${file}_1.csv
    sed -i "s/ñ/Ñ/g" ${file}_1.csv
    iconv -f UTF-8 -t latin1 ${file}_1.csv > ${file}.csv
    rm ${file}_1.csv
  done

  sed -i 's/, /;/g' DATOS_LICITACIONES_bloques.csv
  sed -i 's/\([A-Z]\) Y \([A-Z]\)/\1;\2/g' DATOS_LICITACIONES_bloques.csv

  aa=$(ls *.csv)
  ssconvert --merge-to=TABLAS.xls $aa
}

##########################################################
########## LICITANTES ###################################
########################################################

CreateLICITANTES() {
  cat schema_licitantes.txt | sqlplus cmde_raw/raw17${1}
}

TruncateLICITANTES() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_LICITANTES;" | sqlplus cmde_raw/raw17${1}
}

LoadLICITANTES() {
  sqlldr cmde_raw/raw17${1} control=loader_licitantes.ctl
}


##########################################################
########## EMPRESAS #####################################
########################################################


CreateEMPRESAS() {
  cat schema_empresas.txt | sqlplus cmde_raw/raw17${1}
}

TruncateEMPRESAS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_EMPRESAS;" | sqlplus cmde_raw/raw17${1}
}

LoadEMPRESAS() {
  sqlldr cmde_raw/raw17${1} control=loader_empresas.ctl
}


##########################################################
########## INTERMEDIA ###################################
########################################################


CreateINTERMEDIA() {
  cat schema_intermedia.txt | sqlplus cmde_raw/raw17${1}
}

TruncateINTERMEDIA() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_LIC_EMP;" | sqlplus cmde_raw/raw17${1}
}

LoadINTERMEDIA() {
  sqlldr cmde_raw/raw17${1} control=loader_intermedia.ctl
}


##########################################################
########## OPERADORES ###################################
########################################################


CreateOPERADORES() {
  cat schema_operadores.txt | sqlplus cmde_raw/raw17${1}
}

TruncateOPERADORES() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_OPERADORES;" | sqlplus cmde_raw/raw17${1}
}

LoadOPERADORES() {
  iconv -f latin1 -t UTF-8 DATOS_LICITACIONES_operadores.csv > operadores1.csv
  rm DATOS_LICITACIONES_operadores.csv
  sed -i 's/é/É/g' operadores1.csv
  sed -i 's/ó/Ó/g' operadores1.csv
  sed -i 's/í/Í/g' operadores1.csv
  iconv -f UTF-8 -t latin1 operadores1.csv > DATOS_LICITACIONES_operadores.csv
  rm operadores1.csv
  sqlldr cmde_raw/raw17${1} control=loader_operadores.ctl
}


##########################################################
########## OFERTAS ######################################
########################################################


CreateOFERTAS() {
  cat schema_ofertas.txt | sqlplus cmde_raw/raw17${1}
}

TruncateOFERTAS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_OFERTAS;" | sqlplus cmde_raw/raw17${1}
}

LoadOFERTAS() {
  iconv -f latin1 -t utf-8 DATOS_LICITACIONES_ofertas.csv > ofertas.csv
  rm DATOS_LICITACIONES_ofertas.csv
  sed -i 's/á/Á/g' ofertas.csv
  sed -i 's/é/É/g' ofertas.csv
  sed -i 's/í/Í/g' ofertas.csv
  sed -i 's/ó/Ó/g' ofertas.csv
  sed -i 's/ú/Ú/g' ofertas.csv
  sed -i 's/ñ/Ñ/g' ofertas.csv
  iconv -f utf-8 -t latin1 ofertas.csv > DATOS_LICITACIONES_ofertas.csv
  rm ofertas.csv
  sqlldr cmde_raw/raw17${1} control=loader_ofertas.ctl
}


##########################################################
########## PROCESOS #####################################
########################################################


CreatePROCESOS() {
  cat schema_procesos.txt | sqlplus cmde_raw/raw17${1}
}

TruncatePROCESOS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_PROCESOS;" | sqlplus cmde_raw/raw17${1}
}

LoadPROCESOS() {
  sed -i 's/[.]0$//g' DATOS_LICITACIONES_procesos.csv
  sqlldr cmde_raw/raw17${1} control=loader_procesos.ctl
}


##########################################################
########## BLOQUES #####################################
########################################################


CreateBLOQUES() {
  cat schema_bloques.txt | sqlplus cmde_raw/raw17${1}
}

TruncateBLOQUES() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_BLOQUES;" | sqlplus cmde_raw/raw17${1}
}

LoadBLOQUES() {
  sqlldr cmde_raw/raw17${1} control=loader_bloques.ctl
}

DropBLOQUES() {
  echo "DROP TABLE DATOS_LICITACIONES_BLOQUES;" | sqlplus cmde_raw/raw17${1}
}


##########################################################
########## CAMPOS #######################################
########################################################


CreateCAMPOS() {
  cat schema_campos.txt | sqlplus cmde_raw/raw17${1}
}

TruncateCAMPOS() {
  echo "TRUNCATE TABLE DATOS_LICITACIONES_CAMPOS;" | sqlplus cmde_raw/raw17${1}
}

LoadCAMPOS() {
  sqlldr cmde_raw/raw17${1} control=loader_campos.ctl
}

DropCAMPOS() {
  echo "DROP TABLE DATOS_LICITACIONES_CAMPOS;" | sqlplus cmde_raw/raw17${1}
}


CrearTODO() {
  for i in LICITANTES EMPRESAS INTERMEDIA OPERADORES OFERTAS PROCESOS BLOQUES CAMPOS; do
    echo $i
    Create${i} ${1};
    echo ""
    echo ""
  done
}


DropTODO() {
  for i in LICITACIONES_LIC_EMP LICITACIONES_PROCESOS LICITACIONES_OFERTAS LICITACIONES_LICITANTES LICITACIONES_EMPRESAS LICITACIONES_OPERADORES LICITACIONES_CAMPOS LICITACIONES_BLOQUES; do
    echo $i
    echo "DROP TABLE DATOS_$i;" | sqlplus cmde_raw/raw17${1}
    echo ""
    echo ""
  done
}


CreateTODO() {
 for i in LICITANTES EMPRESAS INTERMEDIA OPERADORES OFERTAS PROCESOS BLOQUES CAMPOS; do
  Create${i} ${1}
 done
}


CargarTODO() {
 for i in LICITANTES EMPRESAS INTERMEDIA OPERADORES OFERTAS PROCESOS BLOQUES CAMPOS; do
  Load${i} ${1}
 done
}

PrintTABLAS() {
  echo "select table_name from user_tables;" | sqlplus cmde_raw/raw17${1}
}

BorrarLogBad() {
  rm *.bad *.log
}

CheckERRORES() {
  for i in *.log; do
    echo $i;
    cat $i | grep "Total logical records";
  done
}

ConvertirUTF8() {
  for i in *.csv; do
    iconv -f latin1 -t utf-8 ${i} > ${i%.*}1.csv;
    rm $i;
    mv ${i%.*}1.csv ${i%.*}.csv;
  done
}

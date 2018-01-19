descargar() {
link=(
'https://rondasmexico.gob.mx/wp-content/uploads/Shapes-R1-CSte.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2015/09/Shapes-Areas-L02.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2015/09/AC_R1_3aConv_pol-para-Publicacion.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2016/10/R1L4-1.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2015/09/R2_1a_Convocatoria_Aguas_Someras.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2017/07/R2L02.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2016/11/Areas-2.3.rar'
'https://rondasmexico.gob.mx/wp-content/uploads/2017/11/R2L4_AP_jULIO_2017.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2016/07/Asignaciones_Bloque_Trion.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2017/03/Shapes-AC.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2017/04/Cardenas_Mora.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2017/04/Ogarrio.zip'
'https://rondasmexico.gob.mx/wp-content/uploads/2017/09/Bloque_Nobilis-Maximino_Word.zip'
)

lic=(
R1.1
R1.2
R1.3
R1.4
R2.1
R2.2
R2.3
R2.4
TRION
AYIN-BATSIL
CARDENAS-MORA
OGARRIO
NOBILIS-MAXIMINO
)

for i in ${!link[@]}
do
  dir=${lic[$i]}
  mkdir $dir; cd $dir
  curl -O ${link[$i]}

  filename=$(basename ${link[$i]})
  ext=${filename##*.}

  echo $filename
  echo $ext

  if [[ $ext -eq rar ]]
  then
    unrar e $filename
  fi

  if [[ $ext -eq zip ]]
  then
    unzip $filename
  fi

  if [ -d __MACOSX ]; then rm -r __MACOSX; fi
  if [ -d ]; then mv */* ./; fi
  if [ -d ]; then mv */* ./; fi

  rm ${filename}
  rm -r */
  cd ..
done
}


shapes()  {
 for dir in */; do
  file=$(ls $dir*.shp)
  python shapes.py $file
 done
}

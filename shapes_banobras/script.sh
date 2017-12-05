descargar() {
  for i in Ronda%203.1; do #Ronda%202.4 Nobilis-Maximino; do #Ronda%201.1 Ronda%201.2 Ronda%201.3 Ronda%201.4 Ronda%202.1 Ronda%202.2 Ronda%202.3 Trion; do
    curl "https://portal.cnih.cnh.gob.mx/iicnih2/downloads/es_MX/$i.zip" -O
    dir_=$(echo $i | sed s/%2/_/g)
    mkdir $dir_
    unzip "$i".zip -d $dir_
    rm "$i.zip"
    rm $dir_/*.xls
    unzip "$dir_/*.zip" -d $dir_
    rm $dir_/*.zip
  done
}

despegar() {
  for i in */; do
    python shapes.py $i*.shp
    rm $i*.*;
  done
}

borrar() {
  rm -r */
}

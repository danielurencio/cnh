for i in Ronda%201.1 Ronda%201.2 Ronda%201.3 Ronda%201.4 Ronda%202.1 Ronda%202.2 Ronda%202.3 Trion; do
  curl "https://portal.cnih.cnh.gob.mx/iicnih2/downloads/es_MX/$i.zip" -O
  mkdir $i
  unzip "$i".zip -d $i
  rm "$i.zip"
  rm ${i}/*.xls
  unzip "${i}/*.zip" -d $i
  rm ${i}/*.zip
done

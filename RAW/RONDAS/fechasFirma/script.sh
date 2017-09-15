fechas() {
  curl http://rondasmexico.gob.mx/ | grep 'class="contratosp2"' | cut -d'>' -f3 | cut -d'<' -f1 > fechas.txt
  sed -i 's/mayo/05/g' fechas.txt
  sed -i 's/marzo/03/g' fechas.txt
  sed -i 's/agosto/08/g' fechas.txt
  sed -i 's/febrero/02/g' fechas.txt
  sed -i 's/septiembre/09/g' fechas.txt
  sed -i 's/noviembre/11/g' fechas.txt
  sed -i 's/ de /-/g' fechas.txt
#  sed -i 's/^\([0-9]\)/,\1/g' fechas.txt

  curl http://rondasmexico.gob.mx/ | grep 'class="oAzul"' | cut -d '>' -f2 | cut -d '<' -f1 > rondas.txt

  paste -d , rondas.txt fechas.txt > tt.txt

  rm fechas.txt rondas.txt
  echo "area,fecha" > head
  cat head tt.txt > fechas.csv
  rm head tt.txt
}


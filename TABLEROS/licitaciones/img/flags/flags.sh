curl "https://downloads.gosquared.com/pixels/flags.zip" > flags.zip;
unzip flags.zip;
rm -r flags-iso; rm flags.zip *.txt
mv flags/shiny/32/ ./
rm -r flags
mv 32 FLAGS

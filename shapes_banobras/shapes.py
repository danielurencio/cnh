import geopandas as gpd
import sys
import os

file_ = sys.argv[1]
dir_ = file_.split("/")[0]
feat = "Asignacion"#'AGRU_1008'#'Area_Cntr'#u'\xc1rea_co_1'

attrs = gpd.read_file(file_)
areas = attrs[feat].values.tolist()
print areas
print " "
for i in areas:
  output = attrs[attrs[feat] == i]
  output_file = i + u".shp"
  carpeta_area = dir_ + "/" + i
  os.makedirs(carpeta_area)
  dir__ = dir_ + "/" + i + "/" + output_file
  print dir__
  output.to_file(dir__)

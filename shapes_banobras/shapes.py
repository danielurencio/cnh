import geopandas as gpd
import pandas as pd
import sys
import ast
from pymongo import MongoClient

col = MongoClient("mongodb://localhost:27017").cnh.poligonos_bloques

file_ = sys.argv[1]
lic_ = file_.split("/")[0]

df = gpd.read_file(file_).to_crs(epsg=4326)

print " "
print lic_
print df.columns.values
print df.shape

for i,d in df.iterrows():
  json_ = ast.literal_eval(df[i:i+1].to_json())
  json_["lic"] = lic_
#  col.insert_one(json_)
  print json_
  
#df.to_crs(epsg=4326)
#gpd.GeoDataFrame.from_features(bloques[0]["features"]).to_file(driver='ESRI Shapefile',filename='file.shp')

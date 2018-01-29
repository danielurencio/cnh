import os
import ast
import pandas as pd
import geopandas as gpd
import numpy as np
from sqlalchemy import create_engine
from shapely.ops import cascaded_union

engine = create_engine('oracle://cmde_raw:raw17@172.16.120.3:1521/cnih')
query = "select poligono from datos_licitaciones_bloques1 where RONDA='2' and LICITACION='4' and poligono is not null"

df = pd.read_sql(query,engine)
arr = map(lambda x:ast.literal_eval(x),df.poligono.tolist())
#arr = map(lambda x:gpd.GeoDataFrame.from_features(x["features"]),arr)


def mergePolygons():
  polygons = []
  for i,d in enumerate(arr):
    polygon = gpd.GeoDataFrame.from_features(d["features"])
    polygons.append(polygon.geometry[0])
  union = gpd.GeoSeries(cascaded_union(polygons))
  return union


'''
for i,d in enumerate(arr):
  area = i
  print area
  os.makedirs(str(i))
  d.to_file(driver='ESRI Shapefile',filename=str(i) + '/file.shp')
'''

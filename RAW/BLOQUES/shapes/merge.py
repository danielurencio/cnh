import geopandas as gpd
import pandas as pd
import ast
from pymongo import MongoClient
from shapely.ops import cascaded_union

col = MongoClient("mongodb://localhost:27017").cnh.poligonos


def mergePolygons(lic):
  polygons = []
  query = col.find({ 'lic':lic })
  for i,d in enumerate(query):
    polygon = gpd.GeoDataFrame.from_features(d["features"])
    polygons.append(polygon.geometry[0])
  union = gpd.GeoSeries(cascaded_union(polygons)).to_json()
  return ast.literal_eval(union)


'''
  for i,d in enumerate(query):
    if i == 0:
      df = gpd.GeoDataFrame.from_features(d["features"])
    else:
      temp = gpd.GeoDataFrame.from_features(d["features"])
      df.append(temp)
  return df
'''

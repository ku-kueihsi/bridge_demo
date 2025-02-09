from sqlalchemy import create_engine, types
import pandas as pd
import typing

# def degreeToDecimal(d: typing.AnyStr):
#   sign = 1.0
#   offset = 0
#   if (d[0] == '0'):
#     sign = -1.0
#     offset = 1
#   return sign * (float(d[offset:offset + 2]) + float(d[offset + 2: offset + 4]) / 60.0 + (float(d[offset + 4:offset + 6]) + float(d[offset + 6:]) * 0.01) / 3600.0)
# engine = create_engine('postgresql://postgres@localhost/postgres')
# df = pd.read_csv('./CA22.csv', dtype='string')
# df['id'] = [s1 + ',' +  s2 for [s1, s2] in zip(df['STATE_CODE_001'], df['STRUCTURE_NUMBER_008'])]
# df['Longitude'] = [degreeToDecimal(d) for d in df['LONG_017']]
# df['Latitude'] = [degreeToDecimal(d) for d in df['LAT_016']]
# df.to_sql('pandas_db', engine, if_exists='replace', index=False)


def usLatLngToDec(l):
  return (float(l[0:-6]) + float(l[-6: -4]) / 60.0 + (float(l[-4:]) * 0.01) / 3600.0)

engine = create_engine('postgresql://postgres@localhost/postgres')
df = pd.read_csv('./CA22.csv', dtype='string')
df['id'] = [s1 + ',' +  s2 for [s1, s2] in zip(df['STATE_CODE_001'], df['STRUCTURE_NUMBER_008'])]
df['Longitude'] = [-usLatLngToDec(d) for d in df['LONG_017']]
df['Latitude'] = [usLatLngToDec(d) for d in df['LAT_016']]
df.to_sql('pandas_db', engine, if_exists='replace', index=False)


print("Run SQL commands after importing")
print("ALTER TABLE pandas_db ADD COLUMN geom geometry(Point, 4326);")
print("UPDATE pandas_db SET geom = ST_SetSRID(ST_MakePoint(\"Longitude\", \"Latitude\"), 4326);")
print("CREATE INDEX locations_geom_idx ON pandas_db USING GIST(geom);")
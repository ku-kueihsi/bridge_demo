from sqlalchemy import create_engine, types
import pandas as pd
import typing

def degreeToDecimal(d: typing.AnyStr):
  sign = 1.0
  offset = 0
  if (d[0] == '0'):
    sign = -1.0
    offset = 1
  return sign * (float(d[offset:offset + 2]) + float(d[offset + 2: offset + 4]) / 60.0 + (float(d[offset + 4:offset + 6]) + float(d[offset + 6:]) * 0.01) / 3600.0)

engine = create_engine('postgresql://postgres@localhost/postgres')
df = pd.read_csv('./ziplatlng.csv')
df.to_sql('ziplatlng', engine, if_exists='replace', index=False, dtype={'ZIP': types.INT, 'LAT': types.Float, 'LNG': types.Float})
print("Run SQL commands after importing")
print("CREATE INDEX idx_ziplatlng ON ziplatlng USING hash(\"ZIP\");")
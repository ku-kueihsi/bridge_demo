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
df = pd.read_csv('./RI_lite.csv', dtype='string')
df['id'] = [s1 + ',' +  s2 for [s1, s2] in zip(df['STATE_CODE_001'], df['STRUCTURE_NUMBER_008'])]
df['Longitude'] = [degreeToDecimal(d) for d in df['LONG_017']]
df['Latitude'] = [degreeToDecimal(d) for d in df['LAT_016']]
df.to_sql('pandas_db', engine, if_exists='replace', index=False)
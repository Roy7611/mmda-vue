# -*- coding: utf-8 -*-
import pymysql

conn = pymysql.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="icanfly",
    charset="utf8mb4",
)
cur = conn.cursor()
cur.execute("SHOW DATABASES LIKE 'mmda%'")
print("dbs:", cur.fetchall())
cur.execute("SHOW TABLES FROM mmda_mes")
tables = [r[0] for r in cur.fetchall()]
print("mmda_mes table count:", len(tables))
for name in ["Worker", "worker", "Station", "station", "Site", "site", "WorkTeamType", "workteamtype"]:
    print(f"  has {name}:", name in tables or name.lower() in {t.lower() for t in tables})
print("sample tables:", tables[:30])
cur.close()
conn.close()

# -*- coding: utf-8 -*-
import re
from pathlib import Path
import pymysql

# local DB: any table containing worker/station/site as whole word-ish
conn = pymysql.connect(host="127.0.0.1", user="root", password="icanfly", database="mmda_mes")
cur = conn.cursor()
cur.execute("SHOW TABLES")
tables = [r[0] for r in cur.fetchall()]
print("looking for exact names...")
for t in tables:
    if t.lower() in {"worker", "station", "site", "workteamtype", "crew", "workstation", "worksite"}:
        print(" exact:", t)
        cur.execute(f"SHOW CREATE TABLE `{t}`")
        print(cur.fetchone()[1][:300])
        print("---")

# metadata: how Worker is defined
cur.execute("SHOW COLUMNS FROM mmda_metadata.metaobject")
cols = [r[0] for r in cur.fetchall()]
print("metaobject cols:", cols)
name_col = "objName" if "objName" in cols else ("objectName" if "objectName" in cols else cols[0])
db_col = "dbName" if "dbName" in cols else ("databaseName" if "databaseName" in cols else None)
sql = f"SELECT * FROM mmda_metadata.metaobject WHERE {name_col} IN ('Worker','Station','Site','Crew','WorkStation','WorkSite') LIMIT 20"
print("sql", sql)
cur.execute(sql)
rows = cur.fetchall()
print("meta rows", len(rows))
# print with column names
cur.execute(f"SELECT {', '.join(cols)} FROM mmda_metadata.metaobject WHERE {name_col} IN ('Worker','Station','Site','Crew','WorkStation','WorkSite')")
for row in cur.fetchall():
    d = dict(zip(cols, row))
    keep = {k: d[k] for k in d if k.lower() in {"objname","objectname","dbname","databasename","tablename","table","modulecode","status"} or "name" in k.lower() or "table" in k.lower() or "db" in k.lower()}
    print(keep if keep else d)

# also local metadata
print("==== local metadata ====")
cur.execute("SHOW COLUMNS FROM mmda_metadata_local.metaobject")
cols2 = [r[0] for r in cur.fetchall()]
print(cols2)
nc = "objName" if "objName" in cols2 else cols2[0]
cur.execute(f"SELECT * FROM mmda_metadata_local.metaobject WHERE {nc} IN ('Worker','Station','Site','Crew','WorkStation','WorkSite')")
print("local rows", cur.rowcount)
for row in cur.fetchall():
    d = dict(zip(cols2, row))
    print({k: d[k] for k in d if any(x in k.lower() for x in ["name", "table", "db", "module"])})

cur.close()
conn.close()

# backup: search INSERT/CREATE mentioning worker as table
p = Path(r"D:\Java\mmda\backup\mmda_mes-2025-server.sql")
hits = []
with p.open("r", encoding="utf-8", errors="replace") as f:
    for i, line in enumerate(f, 1):
        if re.search(r"(?i)create table .*`?worker`?\b", line) or re.search(r"(?i)insert into `?worker`?\b", line):
            hits.append((i, line.strip()[:180]))
            if len(hits) >= 10:
                break
print("backup worker hits", hits)

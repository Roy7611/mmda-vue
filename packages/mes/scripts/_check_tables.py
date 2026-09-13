# -*- coding: utf-8 -*-
import re
from pathlib import Path
import pymysql

conn = pymysql.connect(host="127.0.0.1", user="root", password="icanfly", database="mmda_mes")
cur = conn.cursor()
cur.execute("SHOW TABLES")
tables = sorted(r[0] for r in cur.fetchall())
print("total", len(tables))
for k in ["crew", "station", "site", "work", "worker", "line", "portal"]:
    print(k + ":", [t for t in tables if k in t.lower()])
cur.close()
conn.close()

backup = Path(r"D:\Java\mmda\backup\mmda_mes-2026.sql")
print("backup exists", backup.exists(), "size_mb", round(backup.stat().st_size / 1024 / 1024, 1) if backup.exists() else None)
if backup.exists():
    counts = {n: 0 for n in ["Worker", "Station", "Site", "Crew", "WorkTeamType"]}
    with backup.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            for n in counts:
                if re.search(rf"CREATE TABLE [`\"]?{n}[`\"]?", line, re.I):
                    counts[n] += 1
    print("CREATE TABLE in backup:", counts)

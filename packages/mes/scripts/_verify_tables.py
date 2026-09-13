# -*- coding: utf-8 -*-
import re
from pathlib import Path
import pymysql

BACKUP = Path(r"D:\Java\mmda\backup\mmda_mes-2025-server.sql")

# find workteam-like create tables
hits = []
with BACKUP.open("r", encoding="utf-8", errors="replace") as f:
    for i, line in enumerate(f, 1):
        if re.search(r"(?i)create table.*`?(workteam|teamtype|work_team)", line):
            hits.append((i, line.strip()[:200]))
print("hits", hits[:20])

conn = pymysql.connect(host="127.0.0.1", user="root", password="icanfly", database="mmda_mes")
cur = conn.cursor()
for sql in [
    "SELECT COUNT(*) FROM worker",
    "SELECT COUNT(*) FROM station",
    "SELECT COUNT(*) FROM site",
    "SELECT COUNT(*) FROM worker WHERE workerID BETWEEN 0 AND 9223372036854775807",
]:
    try:
        cur.execute(sql)
        print("OK", sql, "->", cur.fetchone())
    except Exception as e:
        print("FAIL", sql, "->", e)

# workteamtype in metadata?
cur.execute("SELECT objName FROM mmda_metadata.metaobject WHERE objName LIKE '%Team%' OR objName LIKE '%Worker%'")
print("meta teams/workers:", cur.fetchall())
cur.close()
conn.close()

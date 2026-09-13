# -*- coding: utf-8 -*-
import re
from pathlib import Path
import pymysql

log = Path(r"D:\Java\mmda\logs\mmda-mes.log").read_text(encoding="utf-8", errors="replace")
# recent errors
for pat in [
    r"ProjectMaterial",
    r"项目物料",
    r"getPagedList",
    r"BadSqlGrammar",
    r"doesn't exist",
    r"ERROR",
]:
    print(pat, log.count(pat))

# last ERROR blocks mentioning Project or Material or paged
errors = [m.start() for m in re.finditer(r"(?m)^\d{4}-\d{2}-\d{2}.*ERROR", log)]
print("error_count", len(errors))
for start in errors[-15:]:
    chunk = log[start : start + 500]
    if any(k in chunk for k in ["Project", "Material", "Paged", "SQL", "Worker", "Station", "Site", "parse", "Exception"]):
        print("====")
        print(chunk[:500])

conn = pymysql.connect(host="127.0.0.1", user="root", password="icanfly", database="mmda_mes")
cur = conn.cursor()
cur.execute("SHOW TABLES LIKE '%project%material%'")
print("tables", cur.fetchall())
cur.execute("SHOW TABLES LIKE '%projectmaterial%'")
print("tables2", cur.fetchall())
cur.execute("SHOW TABLES")
all_t = [r[0] for r in cur.fetchall()]
print("project*:", [t for t in all_t if "project" in t.lower()])
cur.close()
conn.close()

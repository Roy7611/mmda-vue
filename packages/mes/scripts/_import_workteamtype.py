# -*- coding: utf-8 -*-
import re
from pathlib import Path
import pymysql

BACKUP = Path(r"D:\Java\mmda\backup\mmda_mes-2025-server.sql")
needle = "workteamtype"
hits = []
create_stmt = None
buf = []
capturing = False
with BACKUP.open("r", encoding="utf-8", errors="replace") as f:
    for i, line in enumerate(f, 1):
        low = line.lower()
        if needle in low and ("create table" in low or capturing):
            hits.append((i, line.strip()[:180]))
        if not capturing:
            m = re.match(r"CREATE TABLE(?: IF NOT EXISTS)? `?(\w+)`?", line, re.I)
            if m and m.group(1).lower() == needle:
                capturing = True
                buf = [line]
        else:
            buf.append(line)
            if line.strip().endswith(";"):
                create_stmt = "".join(buf)
                capturing = False
                break

print("hits", len(hits), hits[:5])
print("create found", create_stmt is not None, "len", len(create_stmt or ""))
if create_stmt:
    create_stmt = re.sub(
        r"CREATE TABLE(?! IF NOT EXISTS)",
        "CREATE TABLE IF NOT EXISTS",
        create_stmt,
        count=1,
        flags=re.I,
    )
    conn = pymysql.connect(host="127.0.0.1", user="root", password="icanfly", database="mmda_mes", autocommit=True)
    cur = conn.cursor()
    cur.execute(create_stmt)
    print("created workteamtype")
    cur.execute("SHOW TABLES LIKE 'workteamtype'")
    print(cur.fetchall())
    cur.close()
    conn.close()

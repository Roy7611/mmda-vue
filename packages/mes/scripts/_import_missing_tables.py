# -*- coding: utf-8 -*-
"""Extract CREATE TABLE (+ optional indexes) for missing mes tables from backup and apply."""
import re
from pathlib import Path
import pymysql

BACKUP = Path(r"D:\Java\mmda\backup\mmda_mes-2025-server.sql")
TARGETS = ["worker", "station", "site", "workteamtype"]

def extract_create_statements(path: Path, tables: list[str]) -> dict[str, str]:
    wanted = {t.lower() for t in tables}
    found: dict[str, str] = {}
    current = None
    buf: list[str] = []
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            if current is None:
                m = re.match(r"CREATE TABLE(?: IF NOT EXISTS)? `?(\w+)`?\s*\(", line, re.I)
                if m and m.group(1).lower() in wanted:
                    current = m.group(1).lower()
                    buf = [line]
            else:
                buf.append(line)
                if re.search(r"\)\s*(ENGINE|;)", line, re.I) or line.strip().endswith(";"):
                    # end of create
                    stmt = "".join(buf)
                    # ensure IF NOT EXISTS
                    stmt = re.sub(
                        r"CREATE TABLE(?! IF NOT EXISTS)",
                        "CREATE TABLE IF NOT EXISTS",
                        stmt,
                        count=1,
                        flags=re.I,
                    )
                    found[current] = stmt
                    current = None
                    buf = []
                    if len(found) == len(wanted):
                        break
    return found


def main() -> None:
    stmts = extract_create_statements(BACKUP, TARGETS)
    print("extracted:", list(stmts.keys()))
    for name, stmt in stmts.items():
        print("====", name, "len", len(stmt))
        print(stmt[:240].replace("\n", " "))

    conn = pymysql.connect(
        host="127.0.0.1",
        user="root",
        password="icanfly",
        database="mmda_mes",
        charset="utf8mb4",
        autocommit=True,
    )
    cur = conn.cursor()
    # Prefer physical tables Worker/Station/Site expected by Java (case depends on lower_case_table_names)
    for name in ["site", "station", "worker", "workteamtype"]:
        if name not in stmts:
            print("MISSING in backup:", name)
            continue
        print("creating", name, "...")
        try:
            cur.execute(stmts[name])
            print("  OK")
        except Exception as e:
            print("  FAIL", e)

    cur.execute("SHOW TABLES")
    tables = {r[0].lower() for r in cur.fetchall()}
    for name in TARGETS:
        print(f"has {name}:", name in tables)
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()

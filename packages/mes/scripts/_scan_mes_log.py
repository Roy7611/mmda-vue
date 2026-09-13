# -*- coding: utf-8 -*-
import gzip
import re
from pathlib import Path

path = Path(r"D:\Java\mmda\logs\mmda-mes.log.2026-09-11.4.gz")
text = gzip.open(path, "rt", encoding="utf-8", errors="replace").read()

print("bad_sql", text.count("BadSqlGrammarException"))
print("Worker", text.count("Worker"))
print("SQLSyntax", text.count("SQLSyntaxErrorException"))

for pat in [
    r"Table '[^']+' doesn't exist",
    r"Unknown column '[^']+'",
    r"SQLSyntaxErrorException:.*",
    r"Caused by: java\.sql\.SQLException:.*",
    r"Caused by: java\.sql\.SQLSyntaxErrorException:.*",
]:
    ms = list(re.finditer(pat, text))
    print(pat, "->", len(ms))
    for m in ms[:5]:
        print(" ", m.group(0)[:400])

# Print full Worker BadSql block
idx = text.find("`mmda_mes`.`Worker`")
if idx < 0:
    idx = text.find("Worker` AS t")
print("worker_idx", idx)
if idx >= 0:
    start = max(0, idx - 500)
    print(text[start : idx + 2500])

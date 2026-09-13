# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(r"D:\Java\mmda\backup\mmda_mes-2025-server.sql")
print("scanning", p.name, "size_mb", round(p.stat().st_size / 1024 / 1024, 1))
counts = {n: 0 for n in ["Worker", "Station", "Site", "Crew", "WorkStation", "WorkSite", "WorkTeamType"]}
samples = {}
with p.open("r", encoding="utf-8", errors="replace") as f:
    for i, line in enumerate(f, 1):
        for n in counts:
            if re.search(rf"CREATE TABLE [`\"]?{n}[`\"]?", line, re.I):
                counts[n] += 1
                samples.setdefault(n, []).append((i, line.strip()[:160]))
print(counts)
for n, rows in samples.items():
    print(n, rows[:2])

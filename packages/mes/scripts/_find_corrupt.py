# -*- coding: utf-8 -*-
from pathlib import Path

p = Path("packages/mes/src/components/GanntView/ComputeKitting.ts")
text = p.read_text(encoding="utf-8")
for i, line in enumerate(text.splitlines(), 1):
    if "\ufffd" in line and ("console.log" in line or '"' in line):
        print(i, line.encode("unicode_escape").decode("ascii"))

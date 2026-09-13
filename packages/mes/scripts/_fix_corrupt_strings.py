# -*- coding: utf-8 -*-
from pathlib import Path

p = Path("packages/mes/src/components/GanntView/ComputeKitting.ts")
text = p.read_text(encoding="utf-8")
reps = [
    ('console.log(filterData.value, "\u6570\u636e\u3002\u3002\u3002\ufffd?)',
     'console.log(filterData.value, "\u6570\u636e\u3002\u3002\u3002");'),
    ('console.log(firstItem, "\u7b2c\u4e00\u4e2a\u6570\ufffd?)',
     'console.log(firstItem, "\u7b2c\u4e00\u4e2a\u6570\u636e");'),
    ('console.log(res, "\u9886\u6599\ufffd?)',
     'console.log(res, "\u9886\u6599");'),
]
for a, b in reps:
    if a in text:
        text = text.replace(a, b)
        print("fixed", a.encode("unicode_escape"))
    else:
        print("missing", a.encode("unicode_escape"))
p.write_text(text, encoding="utf-8", newline="\n")

# CompleteShipment: dump lines 200-295 with repr of odd chars
cs = Path("packages/mes/src/modules/lineside_inventories/component/CompleteShipment.ts")
lines = cs.read_text(encoding="utf-8").splitlines()
for i in range(199, 295):
    line = lines[i]
    if any(ord(c) > 127 or c in "`$" for c in line):
        print(f"{i+1}:{line.encode('unicode_escape').decode()}")

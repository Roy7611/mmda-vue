# -*- coding: utf-8 -*-
from pathlib import Path

# Fix ToolsPicking broken strings/comments
p = Path("packages/mes/src/components/ToolsPicking.ts")
text = p.read_text(encoding="utf-8")
# broken join separator
old = "failed.join('\ufffd?)"
# find actual
idx = text.find("failed.join(")
print("join snippet:", text[idx:idx+40].encode("unicode_escape"))
# fix common pattern: join('�?) -> join(', ')
import re
text2, n = re.subn(r"failed\.join\('\ufffd\?\)", "failed.join(', ')", text)
print("join fixes", n)
# Fix comments that swallowed newlines: �?\t\tconst -> */\n\t\tconst or just fix �? to end comment
# Pattern: // ...\ufffd?\t\tconst
text2, n2 = re.subn(r"(//[^\n]*?)\ufffd\?(\t+const )", r"\1\n\2", text2)
print("comment-newline fixes", n2)
# Also �? mid-line before code on same line without newline
text2, n3 = re.subn(r"(//[^\n]*?)\ufffd\?[ \t]+(const )", r"\1\n\t\t\2", text2)
print("comment-space fixes", n3)
p.write_text(text2, encoding="utf-8", newline="\n")

# Brace depth for CompleteShipment around 292
cs = Path("packages/mes/src/modules/lineside_inventories/component/CompleteShipment.ts").read_text(encoding="utf-8")
depth = 0
line = 1
in_s = None
esc = False
i = 0
n = len(cs)
interesting = []
while i < n:
    c = cs[i]
    if c == "\n":
        if 190 <= line <= 295:
            interesting.append((line, depth))
        line += 1
        i += 1
        continue
    if in_s:
        if esc:
            esc = False
        elif c == "\\":
            esc = True
        elif c == in_s:
            in_s = None
        elif in_s == "`" and c == "$" and i + 1 < n and cs[i + 1] == "{":
            # enter ${} - simplistic: track brace until matching }
            i += 2
            td = 1
            while i < n and td > 0:
                if cs[i] == "{":
                    td += 1
                elif cs[i] == "}":
                    td -= 1
                elif cs[i] in "\"'`":
                    q = cs[i]
                    i += 1
                    while i < n and cs[i] != q:
                        if cs[i] == "\\" and q != "`":
                            i += 1
                        i += 1
                i += 1
            continue
        i += 1
        continue
    if c in "\"'`":
        in_s = c
        i += 1
        continue
    if c == "/" and i + 1 < n and cs[i + 1] == "/":
        while i < n and cs[i] != "\n":
            i += 1
        continue
    if c == "/" and i + 1 < n and cs[i + 1] == "*":
        i += 2
        while i < n - 1 and not (cs[i] == "*" and cs[i + 1] == "/"):
            if cs[i] == "\n":
                line += 1
            i += 1
        i += 2
        continue
    if c == "{":
        depth += 1
    elif c == "}":
        depth -= 1
    i += 1
print("depth by line:")
for ln, d in interesting:
    if ln in (196, 202, 205, 245, 268, 288, 290, 291, 292, 293, 294):
        print(ln, d)

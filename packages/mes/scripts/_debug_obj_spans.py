# -*- coding: utf-8 -*-
from pathlib import Path

text = Path("packages/mes/src/modules/production_orders/ProductionOrderLogic.ts").read_text(encoding="utf-8")
n = len(text)
i = 0
while i < n:
    if text[i] == "=" and i + 1 < n:
        j = i + 1
        while j < n and text[j] in " \t\r\n":
            j += 1
        if j < n and text[j] in "{[":
            opener = text[j]
            closer = "}" if opener == "{" else "]"
            start = i
            i = j + 1
            depth = 1
            in_s = None
            esc = False
            while i < n and depth > 0:
                c = text[i]
                if in_s is not None:
                    if esc:
                        esc = False
                    elif c == "\\":
                        esc = True
                    elif c == in_s:
                        in_s = None
                    i += 1
                    continue
                if c in "\"'`":
                    in_s = c
                    i += 1
                    continue
                if c == "/" and i + 1 < n and text[i + 1] == "/":
                    while i < n and text[i] != "\n":
                        i += 1
                    continue
                if c == "/" and i + 1 < n and text[i + 1] == "*":
                    i += 2
                    while i < n - 1 and not (text[i] == "*" and text[i + 1] == "/"):
                        i += 1
                    i += 2
                    continue
                if c == opener:
                    depth += 1
                elif c == closer:
                    depth -= 1
                i += 1
            end = i
            line = text[:start].count("\n") + 1
            end_line = text[:end].count("\n") + 1
            after = text[end : end + 5]
            span = end - start
            if span > 80 or (after and after[0] == ")"):
                preview = text[start : start + 50].replace("\n", "\\n")
                print(f"line {line}-{end_line} span={span} after={after!r} start={preview!r}")
            continue
    i += 1

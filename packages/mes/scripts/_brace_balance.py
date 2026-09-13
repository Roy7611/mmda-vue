# -*- coding: utf-8 -*-
from pathlib import Path

text = Path("packages/mes/src/modules/projects/ProjectLogic.ts").read_text(encoding="utf-8")
depth_b = depth_p = depth_s = 0
line = 1
in_s = None
esc = False
i = 0
n = len(text)
stack = []
while i < n:
    c = text[i]
    if c == "\n":
        line += 1
    if in_s:
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
            if text[i] == "\n":
                line += 1
            i += 1
        i += 2
        continue
    if c == "{":
        depth_b += 1
        stack.append((line, "{"))
    elif c == "}":
        depth_b -= 1
        if stack:
            stack.pop()
    elif c == "(":
        depth_p += 1
        stack.append((line, "("))
    elif c == ")":
        depth_p -= 1
        if stack:
            stack.pop()
    elif c == "[":
        depth_s += 1
        stack.append((line, "["))
    elif c == "]":
        depth_s -= 1
        if stack:
            stack.pop()
    if depth_b < 0 or depth_p < 0 or depth_s < 0:
        print("negative at", line, depth_b, depth_p, depth_s)
        break
    i += 1
print("final", depth_b, depth_p, depth_s, "lines", line)
print("unclosed", stack[:20], "total", len(stack))

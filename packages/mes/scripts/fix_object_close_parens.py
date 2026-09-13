#!/usr/bin/env python3
"""Strip stray ')' after object/array literals assigned with '='."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"


def fix_text(src: str) -> tuple[str, int]:
    out: list[str] = []
    i = 0
    n = len(src)
    fixes = 0
    in_s: str | None = None
    esc = False
    while i < n:
        c = src[i]
        # Top-level: skip strings/comments so commented `= {` is not matched.
        if in_s is not None:
            out.append(c)
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
            out.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            while i < n and src[i] != "\n":
                out.append(src[i])
                i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            out.append(c)
            i += 1
            out.append(src[i])
            i += 1
            while i < n - 1 and not (src[i] == "*" and src[i + 1] == "/"):
                out.append(src[i])
                i += 1
            if i < n:
                out.append(src[i])
                i += 1
            if i < n:
                out.append(src[i])
                i += 1
            continue

        if c == "=" and i + 1 < n:
            j = i + 1
            while j < n and src[j] in " \t\r\n":
                j += 1
            if j < n and src[j] in "{[":
                opener = src[j]
                closer = "}" if opener == "{" else "]"
                out.append(src[i : j + 1])
                i = j + 1
                depth = 1
                obj_s: str | None = None
                obj_esc = False
                while i < n and depth > 0:
                    oc = src[i]
                    if obj_s is not None:
                        out.append(oc)
                        if obj_esc:
                            obj_esc = False
                        elif oc == "\\":
                            obj_esc = True
                        elif oc == obj_s:
                            obj_s = None
                        i += 1
                        continue
                    if oc in "\"'`":
                        obj_s = oc
                        out.append(oc)
                        i += 1
                        continue
                    if oc == "/" and i + 1 < n and src[i + 1] == "/":
                        while i < n and src[i] != "\n":
                            out.append(src[i])
                            i += 1
                        continue
                    if oc == "/" and i + 1 < n and src[i + 1] == "*":
                        out.append(oc)
                        i += 1
                        out.append(src[i])
                        i += 1
                        while i < n - 1 and not (src[i] == "*" and src[i + 1] == "/"):
                            out.append(src[i])
                            i += 1
                        if i < n:
                            out.append(src[i])
                            i += 1
                        if i < n:
                            out.append(src[i])
                            i += 1
                        continue
                    if oc == opener:
                        depth += 1
                    elif oc == closer:
                        depth -= 1
                    out.append(oc)
                    i += 1
                k = i
                while k < n and src[k] in " \t":
                    k += 1
                # `});` or bare `})` before newline / `as`
                if k < n and src[k] == ")":
                    nxt = k + 1
                    while nxt < n and src[nxt] in " \t":
                        nxt += 1
                    # keep ) if it's call continuation like })( or }). or })[
                    if nxt >= n or src[nxt] in ";\r\n" or src[nxt : nxt + 2] == "as":
                        out.append(src[i:k])
                        if nxt < n and src[nxt] == ";":
                            out.append(";")
                            i = nxt + 1
                        else:
                            if nxt >= n or src[nxt] in "\r\n":
                                out.append(";")
                            i = k + 1
                        fixes += 1
                        continue
                continue
        out.append(src[i])
        i += 1
    return "".join(out), fixes


def main() -> None:
    total = 0
    changed: list[str] = []
    for path in sorted(ROOT.rglob("*.ts")):
        text = path.read_text(encoding="utf-8")
        new, fixes = fix_text(text)
        if fixes:
            path.write_text(new, encoding="utf-8", newline="\n")
            total += fixes
            changed.append(f"{fixes:3d}  {path.relative_to(ROOT)}")
    print(f"fixed {total} occurrences in {len(changed)} files")
    print("\n".join(changed))


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Remove orphaned __p IIFE blocks left after commented-out .refWhere(...) fields."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

# After a commented this.field(...).refWhere line, strip the live orphaned __p body
# until the matching join(" AND "); + closing }) or }),
ORPHAN_START = re.compile(
    r"(?m)^([ \t]*//[^\n]*\.refWhere[^\n]*\n)"
    r"([ \t]*const __p = [\s\S]*?"
    r"\.join\(\s*\" AND \"\s*\);\s*\n"
    r"[ \t]*\}\),?\s*\n)"
)


def fix_text(text: str) -> tuple[str, int]:
    count = 0

    def repl(m: re.Match) -> str:
        nonlocal count
        count += 1
        comment_line = m.group(1)
        # Keep the comment opener; close the comment block with a note
        return comment_line + "\t\t\t\t// }) — orphaned __p body removed\n"

    new, n = ORPHAN_START.subn(repl, text)
    return new, n


def main() -> None:
    total = 0
    files = 0
    for path in sorted(ROOT.rglob("*Logic.ts")):
        raw = path.read_text(encoding="utf-8")
        new, n = fix_text(raw)
        if n:
            path.write_text(new, encoding="utf-8", newline="\n")
            print(f"  {n}  {path.relative_to(ROOT)}")
            total += n
            files += 1
    print(f"fixed {total} orphaned blocks in {files} files")


if __name__ == "__main__":
    main()

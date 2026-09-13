#!/usr/bin/env python3
from pathlib import Path
import subprocess
import tempfile
import os

ROOT = Path(r"d:/2026/ts/mmda/packages/mes/src")
bad = []
for path in sorted(ROOT.rglob("*.ts")):
    if path.name.endswith(".d.ts"):
        continue
    # esbuild parse-only
    r = subprocess.run(
        ["pnpm", "exec", "esbuild", str(path), "--bundle=false", "--outfile=NUL", "--loader=ts"],
        cwd=r"d:/2026/ts/mmda",
        capture_output=True,
        text=True,
        shell=True,
    )
    err = (r.stderr or "") + (r.stdout or "")
    if r.returncode != 0 or "ERROR" in err:
        line = next((ln for ln in err.splitlines() if "ERROR" in ln or "error:" in ln), err[:180])
        bad.append(f"{path.relative_to(ROOT)} :: {line.strip()}")

print(f"bad={len(bad)}")
print("\n".join(bad[:40]))

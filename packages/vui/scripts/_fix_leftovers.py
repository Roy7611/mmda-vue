# -*- coding: utf-8 -*-
from pathlib import Path

for f, reps in [
    (
        "packages/app/src/style.css",
        [
            ("mmda-page-body", "mmda-page__body"),
            ("mmda-page-header", "mmda-page__header"),
        ],
    ),
    (
        "packages/vui-primevue/src/style.css",
        [
            ("mmda-page-header", "mmda-page__header"),
            ("mmda-page-body", "mmda-page__body"),
        ],
    ),
]:
    p = Path(f)
    if not p.exists():
        print("missing", f)
        continue
    t = p.read_text(encoding="utf-8")
    o = t
    for a, b in reps:
        o = o.replace(a, b)
    if o != t:
        p.write_text(o, encoding="utf-8")
        print("patched", f)
    else:
        print("unchanged", f)

comments = [
    (
        "packages/core/src/ui/builder/table.ts",
        "模块 **index** KeepAlive",
        "模块 **index** 工作区保活",
    ),
    (
        "packages/vui/src/contexts/mixins/data.ts",
        "不改 KeepAlive 列表",
        "不改保活 Index 列表",
    ),
    (
        "packages/vui/src/ui/factory/list.ts",
        "index KeepAlive 宿主",
        "index 工作区保活宿主",
    ),
]
for f, a, b in comments:
    p = Path(f)
    t = p.read_text(encoding="utf-8")
    if a in t:
        p.write_text(t.replace(a, b), encoding="utf-8")
        print("comment", f)
    else:
        print("no match", f)

# css.ts doc example
p = Path("packages/core/src/ui/css.ts")
t = p.read_text(encoding="utf-8")
old = "`uiCssClasses('page-header', 'sticky')` → `mmda-page-header mmda-page-header--sticky`"
new = "`uiCssClass('page', 'header', 'sticky')` → `mmda-page__header--sticky`"
if old in t:
    p.write_text(t.replace(old, new), encoding="utf-8")
    print("css doc")
else:
    print("css doc no match")

# cleanup temp scripts
for s in [
    "packages/vui/scripts/_patch_entity_view_overlay.py",
    "packages/vui/scripts/_patch_routers_and_imports.py",
    "packages/vui/scripts/_bem_page_css.py",
    "packages/vui/scripts/_sanity_overlay.py",
    "packages/vui/scripts/_inspect_ev.py",
    "packages/vui/scripts/_check_css_name.py",
]:
    Path(s).unlink(missing_ok=True)
print("cleaned scripts")

#!/usr/bin/env bash
# ============================================================================
# 渲染图真源 → docs/images/diagrams/*.png
# ----------------------------------------------------------------------------
# 图的文本真源有两处，本脚本只读它们、不改图源：
#   1) docs/**/*.wsd              一个文件可含多个 `@startuml <name>`，各自成一张图
#   2) md 里的 ```plantuml 块     块本身即该图真源；`--write-refs` 会在块后补图片引用
# 产物落在 docs/images/diagrams/，文件名 = 图名（= `@startuml` 后那个名字），
# 所以 md 里引用 `![图](…/ui_layer_roles.png)` 时能一眼对回真源。
#
# 用法：
#   bash scripts/render-diagrams.sh                 # 渲染全部（PNG）
#   bash scripts/render-diagrams.sh --svg           # 同时出 SVG
#   bash scripts/render-diagrams.sh --refs          # 渲染 + 在 md 里补/更新 ![图](…) 引用
#   bash scripts/render-diagrams.sh --check         # 只查 PNG 是否缺失/过期（CI 用；过期则 exit 1）
#
# 依赖 java 17+ 与 plantuml.jar。jar 查找顺序：
#   $PLANTUML_JAR → <repo>/tools/plantuml.jar → %LOCALAPPDATA%/plantuml/plantuml.jar
#   → ~/plantuml/plantuml.jar → ~/.plantuml/plantuml.jar → /usr/share/plantuml/plantuml.jar
#   PATH 上有 `plantuml` 可执行文件时优先用它。（本机 2026-09 实测：OpenJDK 17.0.11 +
#   %LOCALAPPDATA%/plantuml/plantuml.jar，smetana 布局，11 张图全通。）
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/docs/images/diagrams"
DO_SVG=0
DO_REFS=0
CHECK_ONLY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --svg) DO_SVG=1 ;;
    --refs|--write-refs) DO_REFS=1 ;;
    --check) CHECK_ONLY=1 ;;
    -o|--out) shift; OUT="$1" ;;
    -h|--help) sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "未知参数：$1（-h 看用法）" >&2; exit 2 ;;
  esac
  shift
done

# ---------------------------------------------------------------- 找渲染器
find_plantuml() {
  if command -v plantuml >/dev/null 2>&1; then echo "bin:$(command -v plantuml)"; return; fi
  local cand
  for cand in \
    "${PLANTUML_JAR:-}" \
    "$ROOT/tools/plantuml.jar" \
    "${LOCALAPPDATA:-}/plantuml/plantuml.jar" \
    "$HOME/plantuml/plantuml.jar" \
    "$HOME/.plantuml/plantuml.jar" \
    "/usr/share/plantuml/plantuml.jar" \
    "/usr/local/share/plantuml/plantuml.jar"; do
    [ -n "$cand" ] && [ -f "$cand" ] && { echo "jar:$cand"; return; }
  done
  echo ""
}

RENDERER="$(find_plantuml)"
if [ -z "$RENDERER" ]; then
  cat >&2 <<'EOF'
没找到 PlantUML。任选一种：
  1) 下载 jar 放到仓内（推荐，团队一致）：mkdir -p tools && curl -L -o tools/plantuml.jar \
     https://github.com/plantuml/plantuml/releases/download/v1.2025.4/plantuml-1.2025.4.jar
  2) 用环境变量指定：PLANTUML_JAR=/path/to/plantuml.jar bash scripts/render-diagrams.sh
  3) 本机装过：%LOCALAPPDATA%/plantuml/plantuml.jar 或 PATH 上有 plantuml
另需 java 17+（plantuml 1.2024+ 要求）。
EOF
  exit 1
fi

if [ "${RENDERER#bin:}" = "$RENDERER" ]; then
  if ! java -version >/dev/null 2>&1; then
    echo "找到 jar（${RENDERER#jar:}）但没有 java；装 JDK 17+ 后重试。" >&2
    exit 1
  fi
  run_plantuml() { java -jar "${RENDERER#jar:}" "$@"; }
else
  run_plantuml() { "${RENDERER#bin:}" "$@"; }
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/mmda-diagrams.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# java/plantuml 是原生程序，看不懂 MSYS 路径（/d/... 会被当成相对盘符）→ 转一次。
# 只在交给渲染器的那一刻转，脚本自己仍用 MSYS 路径做文件测试。
native() { cygpath -w "$1" 2>/dev/null || printf '%s' "$1"; }

# ------------------------------------------------- 收集图真源（wsd + md 内嵌块）
# 每个条目是 "<tmp 里的源文件>|<原始位置说明>"；md 内嵌块先抽到 tmp。
SOURCES=()

while IFS= read -r wsd; do
  [ -n "$wsd" ] && SOURCES+=("$wsd|${wsd#"$ROOT/"}")
done < <(find "$ROOT/docs" -name '*.wsd' -not -path '*/node_modules/*' | sort)

MD_FILES=()
while IFS= read -r md; do
  [ -n "$md" ] && MD_FILES+=("$md")
done < <(grep -rl --include='*.md' '```plantuml' "$ROOT/docs" "$ROOT/ARCHITECTURE.md" 2>/dev/null | sort || true)

USED_NAMES=""
md_index=0
for md in "${MD_FILES[@]:-}"; do
  [ -n "$md" ] || continue
  stem="$(basename "$md" .md)"
  case " $USED_NAMES " in *" $stem "*) stem="$(basename "$(dirname "$md")")_$stem" ;; esac
  USED_NAMES="$USED_NAMES $stem"
  md_index=$((md_index + 1))
  blockdir="$TMP/blocks/$md_index"          # 每份 md 一个子目录，避免同名前缀的块互相命中
  mkdir -p "$blockdir"
  # 抽块：跳过块内原有的（未命名）@startuml，换成 `@startuml <stem>_<n>`，
  # 这样产物名稳定、可被 md 引用。
  awk -v out="$blockdir" -v stem="$stem" '
    /^```plantuml/ {
      n++; inb=1; f=out "/" stem "_" n ".wsd"
      print "@startuml " stem "_" n > f; next
    }
    inb && /^```[[:space:]]*$/ { inb=0; close(f); next }
    inb {
      if ($0 ~ /^@startuml/) next          # 原块头由上面那行替代
      print > f
    }
  ' "$md"
  i=0
  for f in "$blockdir"/"$stem"_*.wsd; do
    [ -f "$f" ] || continue
    i=$((i + 1))
    SOURCES+=("$f|${md#"$ROOT/"}#$i")
  done
done

if [ "${#SOURCES[@]}" -eq 0 ]; then
  echo "没有找到图真源（docs/**/*.wsd 或 md 里的 \`\`\`plantuml 块）。" >&2
  exit 1
fi

# ------------------------------------------------------------------ 期望产物名
# `@startuml <name>` → <name>.png；未命名 → <文件名>.png（PlantUML 的默认规则）。
expected_names() { # $1 = 源文件
  local names
  names="$(awk '/^@startuml/ { sub(/^@startuml[ \t]*/, ""); print ($0 == "" ? "" : $0) }' "$1")"
  if [ -z "$(printf '%s' "$names" | tr -d '[:space:]')" ]; then
    printf '%s\n' "$(basename "$1" .wsd)"
  else
    printf '%s\n' "$names" | sed '/^$/d'
  fi
}

# 真源内容指纹（前 16 位足够）。过期判据用它而不是 mtime：
# 改 md 里的一句散文不该让图「过期」，只有图源文本变了才算。清单文件随仓提交。
MANIFEST="$OUT/.render-manifest"
src_hash() { sha256sum "$1" | cut -c1-16; }

# ---------------------------------------------------------------------- --check
if [ "$CHECK_ONLY" -eq 1 ]; then
  declare -A HAVE=()
  if [ -f "$MANIFEST" ]; then
    while read -r h name _rest; do
      case "$h" in \#*|'') continue ;; esac
      [ -n "${name:-}" ] && HAVE["$name"]="$h"
    done < "$MANIFEST"
  fi
  stale=0; missing=0; total=0
  for entry in "${SOURCES[@]}"; do
    src="${entry%%|*}"; where="${entry#*|}"
    h="$(src_hash "$src")"
    while IFS= read -r name; do
      total=$((total + 1))
      png="$OUT/$name.png"
      if [ ! -f "$png" ]; then
        echo "缺失  $where → $name.png"; missing=$((missing + 1))
      elif [ "${HAVE[$name]:-}" != "$h" ]; then
        echo "过期  $where → $name.png"; stale=$((stale + 1))
      fi
    done < <(expected_names "$src")
  done
  if [ $((missing + stale)) -gt 0 ]; then
    echo ""
    echo "有 $missing 张缺失、$stale 张过期 → 跑：bash scripts/render-diagrams.sh"
    exit 1
  fi
  echo "所有图都是最新的（${#SOURCES[@]} 个真源 → $total 张 PNG）。"
  exit 0
fi

# ------------------------------------------------------------------------ 渲染
fail=0
ok=0
: > "$TMP/manifest"
for entry in "${SOURCES[@]}"; do
  src="${entry%%|*}"; where="${entry#*|}"
  h="$(src_hash "$src")"
  # -failfast2：语法错就不落盘并返回非 0；-charset UTF-8：中文正常
  out_log="$(run_plantuml -charset UTF-8 -failfast2 -tpng -Playout=smetana -o "$(native "$OUT")" "$(native "$src")" 2>&1)" || fail=$((fail + 1))
  if printf '%s' "$out_log" | grep -qi 'error line\|syntax error\|cannot find'; then
    echo "渲染失败 $where"; printf '%s\n' "$out_log" | sed 's/^/    /' | head -8
    fail=$((fail + 1)); continue
  fi
  while IFS= read -r name; do
    png="$OUT/$name.png"
    if [ -s "$png" ]; then
      printf '  ✓ %-34s %6s KB  ← %s\n' "$name.png" "$(( $(wc -c < "$png") / 1024 ))" "$where"
      printf '%s\t%s\t%s\n' "$h" "$name" "$where" >> "$TMP/manifest"
      ok=$((ok + 1))
    else
      echo "  ✗ $name.png 没生成（← $where）"; fail=$((fail + 1))
    fi
  done < <(expected_names "$src")
  if [ "$DO_SVG" -eq 1 ]; then
    run_plantuml -charset UTF-8 -failfast2 -tsvg -Playout=smetana -o "$(native "$OUT")" "$(native "$src")" >/dev/null 2>&1 || true
  fi
done

# 清单只在全部成功时更新，避免半成品被 --check 当成基线
if [ "$fail" -eq 0 ]; then
  {
    printf '%s\n' "# 源内容 hash | 图名 | 真源位置 —— 由 scripts/render-diagrams.sh 维护，--check 用它判过期"
    sort "$TMP/manifest"
  } > "$MANIFEST"
fi

echo ""
echo "PNG：$ok 张成功，$fail 张失败；目录 $OUT"

# ------------------------------------------------------- md 里补 ![图](…) 引用
if [ "$DO_REFS" -eq 1 ]; then
  echo ""
  echo "同步 md 里的图片引用："
  for md in "${MD_FILES[@]:-}"; do
    [ -n "$md" ] || continue
    stem="$(basename "$md" .md)"
    rel="$(realpath --relative-to="$(dirname "$md")" "$OUT")"
    new="$TMP/$(basename "$md")"
    # 在每块结束的 ``` 之后插一行引用；已经是那一行就不重复插（幂等）。
    awk -v rel="$rel" -v stem="$stem" '
      function flush_pending() { if (pending != "") { print pending; pending = "" } }
      {
        if (pending != "") {
          if ($0 != pending) print pending      # 下一行不是同一条引用才插
          pending = ""
        }
        if (inb && $0 ~ /^```[[:space:]]*$/) {
          print; inb = 0; n++; pending = "![" stem "_" n "](" rel "/" stem "_" n ".png)"; next
        }
        if ($0 ~ /^```plantuml/) { inb = 1 }
        print
      }
      END { flush_pending() }
    ' "$md" > "$new"
    if cmp -s "$md" "$new"; then
      echo "  = $(basename "$md")（已是最新）"
    else
      cp "$new" "$md"
      echo "  + $(basename "$md")（补了引用）"
    fi
  done
fi

[ "$fail" -eq 0 ] || exit 1

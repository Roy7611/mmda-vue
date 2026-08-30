/**
 * Apply scripts/m3-palettes.generated.json into theme sources.
 * Run after generate-m3-palettes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, "..");
const P = JSON.parse(
  readFileSync(join(dir, "m3-palettes.generated.json"), "utf8"),
);
const ids = Object.keys(P);
const labels = {
  indigo: "靛蓝",
  purple: "紫色",
  blue: "蓝色",
  violet: "紫罗兰",
  red: "红色",
  orange: "橙色",
  yellow: "黄色",
  green: "绿色",
  teal: "青绿",
  cyan: "青色",
};

function rgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function mmdaShellVars(S, { includeStatic = false } = {}) {
  const lines = [
    `--mmda-text-color: ${S.onSurface};`,
    `--mmda-text-muted-color: ${S.onSurfaceVariant};`,
    `--mmda-surface-ground: ${S.surfaceGround};`,
    `--mmda-surface-card: ${S.surfaceCard};`,
    `--mmda-surface-group: ${S.surfaceGroup};`,
    `--mmda-content-border-color: ${S.outlineVariant};`,
    `--mmda-primary-color: ${S.primary};`,
    `--mmda-primary-soft: ${S.primaryContainer};`,
    `--mmda-on-primary: ${S.onPrimary};`,
    `--mmda-on-primary-container: ${S.onPrimaryContainer};`,
    `--mmda-secondary-color: ${S.secondary};`,
    `--mmda-secondary-soft: ${S.secondaryContainer};`,
  ];
  if (includeStatic) {
    lines.splice(6, 0, `--mmda-border-radius-lg: 12px;`);
  }
  return lines;
}

function sfVars(S) {
  return [
    `--color-sf-primary: ${rgb(S.primary)};`,
    `--color-sf-primary-container: ${rgb(S.primaryContainer)};`,
    `--color-sf-on-primary: ${rgb(S.onPrimary)};`,
    `--color-sf-on-primary-container: ${rgb(S.onPrimaryContainer)};`,
    `--color-sf-secondary: ${rgb(S.secondary)};`,
    `--color-sf-secondary-container: ${rgb(S.secondaryContainer)};`,
    `--color-sf-on-secondary: ${rgb(S.onSecondary)};`,
    `--color-sf-on-secondary-container: ${rgb(S.onSecondaryContainer)};`,
    `--color-sf-surface-tint-color: ${rgb(S.primary)};`,
    `--color-sf-background: ${rgb(S.background)};`,
    `--color-sf-on-background: ${rgb(S.onBackground)};`,
    `--color-sf-surface: ${rgb(S.surface)};`,
    `--color-sf-on-surface: ${rgb(S.onSurface)};`,
    `--color-sf-surface-variant: ${rgb(S.surfaceVariant)};`,
    `--color-sf-on-surface-variant: ${rgb(S.onSurfaceVariant)};`,
    `--color-sf-outline: ${rgb(S.outline)};`,
    `--color-sf-outline-variant: ${rgb(S.outlineVariant)};`,
    `--color-sf-inverse-surface: ${rgb(S.inverseSurface)};`,
    `--color-sf-inverse-on-surface: ${rgb(S.inverseOnSurface)};`,
    `--color-sf-shadow: ${rgb(S.shadow)};`,
    `--color-sf-scrim: ${rgb(S.scrim)};`,
  ];
}

// --- ui_theme.ts ---
const themePath = join(root, "src/ui/ui_theme.ts");
let themeTs = readFileSync(themePath, "utf8");
const paletteBody = ids
  .map((id) => {
    const p = P[id];
    const scale = Object.entries(p.scale)
      .map(([k, v]) => `      ${k}: "${v}",`)
      .join("\n");
    return `  {
    id: "${id}",
    label: "${labels[id]}",
    previewColor: "${p.seed}",
    scale: {
${scale}
    },
  }`;
  })
  .join(",\n");

themeTs = themeTs.replace(
  /\/\*\*[\s\S]*?export const MMDA_COLOR_PALETTE_IDS/,
  `/**
 * 色板：Theme Studio 种子 = light primary；accent + surface/outline/onSurface
 * 均由 Material Color Utilities 按 MD3 推导（见 scripts/generate-m3-palettes.mjs）。
 * indigo / purple / blue / violet / red / orange / yellow / green / teal / cyan
 */
export const MMDA_COLOR_PALETTE_IDS`,
);

themeTs = themeTs.replace(
  /export const MMDA_COLOR_PALETTES: readonly MmdaColorPaletteOption\[\] = \[[\s\S]*?\] as const;/,
  `export const MMDA_COLOR_PALETTES: readonly MmdaColorPaletteOption[] = [
${paletteBody},
] as const;`,
);
writeFileSync(themePath, themeTs);

// --- theme.css ---
const themeCssPath = join(root, "src/theme.css");
let themeCss = readFileSync(themeCssPath, "utf8");
const rootL = P.purple.light;

const lightBlocks = [
  `:root {
${mmdaShellVars(rootL, { includeStatic: true })
  .map((l) => `  ${l}`)
  .join("\n")}
  --mmda-warning-color: #914c00;
  --mmda-info-color: #01579b;
  --mmda-danger-color: #b3261e;
}`,
  "",
  "/* MD3：accent + surface 均跟色板；soft = primaryContainer / secondaryContainer */",
];
for (const id of ids) {
  if (id === "purple") continue;
  const L = P[id].light;
  lightBlocks.push(`html[data-mmda-palette="${id}"] {
${mmdaShellVars(L)
  .map((l) => `  ${l}`)
  .join("\n")}
}`);
  lightBlocks.push("");
}

const darkBlocks = [
  `html.mmda-dark {
${mmdaShellVars(P.purple.dark)
  .map((l) => `  ${l}`)
  .join("\n")}
  --mmda-warning-color: #f5b482;
  --mmda-info-color: #47acfb;
  --mmda-danger-color: #f2b8b5;
}`,
  "",
];
for (const id of ids) {
  if (id === "purple") continue;
  const D = P[id].dark;
  darkBlocks.push(`html.mmda-dark[data-mmda-palette="${id}"] {
${mmdaShellVars(D)
  .map((l) => `  ${l}`)
  .join("\n")}
}`);
  darkBlocks.push("");
}

themeCss = themeCss.replace(
  /:root \{[\s\S]*?(?=\.mmda-app\b)/,
  [...lightBlocks, ...darkBlocks].join("\n") + "\n",
);

const swatchChecks = [
  'html[data-mmda-palette="purple"] .mmda-palette-swatch--purple::before',
  ...ids
    .filter((id) => id !== "purple")
    .map(
      (id) =>
        `html[data-mmda-palette="${id}"] .mmda-palette-swatch--${id}::before`,
    ),
].join(",\n");

const swatchColors = ids
  .map(
    (id) => `.mmda-palette-swatch--${id} {
  --mmda-palette-preview: ${P[id].seed};
}`,
  )
  .join("\n\n");

themeCss = themeCss.replace(
  /html\[data-mmda-palette="purple"\] \.mmda-palette-swatch--purple::before,[\s\S]*?\.mmda-palette-swatch--cyan \{[\s\S]*?\}/,
  `${swatchChecks} {
  content: "\\2713";
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1;
}

${swatchColors}`,
);

themeCss = themeCss.replace(
  /应用壳层色板（MD3 CorePalette）：[\s\S]*?EJ2 读 --color-sf-\*；壳层 \/ 表单 \/ 菜单读 --mmda-\*\./,
  `应用壳层色板（MD3）：accent + surface/outline/文字均跟 data-mmda-palette。
 *   生成：pnpm --filter @mmda/vui palette:generate
 * EJ2 读 --color-sf-*；壳层 / 表单 / 菜单读 --mmda-*。`,
);
writeFileSync(themeCssPath, themeCss);

// --- Syncfusion（accent + surface）---
const sfPath = join(root, "../vui-syncfusion/src/style.css");
let sfCss = readFileSync(sfPath, "utf8");
const sfBlocks = [
  "/*",
  " * MD3：Theme Studio 种子 = light primary；accent + surface/outline 均跟色板。",
  " */",
];
for (const id of ids) {
  sfBlocks.push(`html[data-mmda-palette="${id}"] {
${sfVars(P[id].light)
  .map((l) => `  ${l}`)
  .join("\n")}
}`);
  sfBlocks.push("");
}
for (const id of ids) {
  sfBlocks.push(`html.e-dark-mode[data-mmda-palette="${id}"],
html.mmda-dark[data-mmda-palette="${id}"] {
${sfVars(P[id].dark)
  .map((l) => `  ${l}`)
  .join("\n")}
}`);
  sfBlocks.push("");
}
sfCss = sfCss.replace(
  /\/\*\n \* (?:Theme Studio 10|Material 3 brand|MD3)[\s\S]*?(?=\.mmda-sf-app\b)/,
  sfBlocks.join("\n") + "\n",
);
if (!sfCss.includes(`--color-sf-surface: ${rgb(P.indigo.light.surface)}`)) {
  throw new Error("Syncfusion palette replace failed (surface missing)");
}
writeFileSync(sfPath, sfCss);

// --- PrimeVue：primary scale（surface 已通过 --mmda-* 别名跟随色板）---
const primePath = join(root, "../vui-primevue/src/style.css");
let primeCss = readFileSync(primePath, "utf8");
const primeBlocks = [];
for (const id of ids) {
  const s = P[id].scale;
  primeBlocks.push(`html[data-mmda-palette="${id}"] {
  --p-primary-50: ${s["50"]};
  --p-primary-100: ${s["100"]};
  --p-primary-200: ${s["200"]};
  --p-primary-300: ${s["300"]};
  --p-primary-400: ${s["400"]};
  --p-primary-500: ${s["500"]};
  --p-primary-600: ${s["600"]};
  --p-primary-700: ${s["700"]};
  --p-primary-800: ${s["800"]};
  --p-primary-900: ${s["900"]};
  --p-primary-950: ${s["950"]};
}`);
  primeBlocks.push("");
}

primeCss = primeCss.replace(
  /html\[data-mmda-palette="(?:indigo|purple)"\] \{[\s\S]*?(?=\.mmda-prime-app\b)/,
  primeBlocks.join("\n"),
);
// palette blocks sit BEFORE .mmda-prime-app in file historically — also try after shared block
if (!primeCss.includes(`--p-primary-600: ${P.indigo.scale["600"]}`)) {
  primeCss = readFileSync(primePath, "utf8");
  primeCss = primeCss.replace(
    /html\[data-mmda-palette="indigo"\] \{[\s\S]*?html\[data-mmda-palette="cyan"\] \{[\s\S]*?\}\n/,
    primeBlocks.join("\n"),
  );
}
if (!primeCss.includes(`--p-primary-600: ${P.indigo.scale["600"]}`)) {
  throw new Error("PrimeVue palette replace failed");
}
writeFileSync(primePath, primeCss);

console.log(
  "Applied MD3 accent+surface palettes to ui_theme.ts, theme.css, syncfusion, primevue",
);
console.log(
  `sample green ground=${P.green.light.surfaceGround} card=${P.green.light.surfaceCard}`,
);

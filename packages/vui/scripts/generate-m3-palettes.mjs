/**
 * 用 @material/material-color-utilities 按 MD3 规范生成色板 token。
 *
 * 约定（对齐 Syncfusion Theme Studio「所选色 = Primary」）：
 * - light.primary = Theme Studio 种子色
 * - accent 其余角色由 CorePalette a1/a2 固定 Tone 推导
 * - surface / outline / onSurface 由 themeFromSourceColor 的中性色板推导
 * - onPrimary：种子 Tone ≥ 60 用深色字，否则白字
 *
 * 运行：node scripts/generate-m3-palettes.mjs
 * 应用：node scripts/apply-m3-palettes.mjs
 */
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  TonalPalette,
  CorePalette,
  themeFromSourceColor,
} from "@material/material-color-utilities";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SEEDS = {
  indigo: "#6610f2",
  purple: "#6750a4",
  blue: "#0d6efd",
  violet: "#6f42c1",
  red: "#dc3545",
  orange: "#fd7e14",
  yellow: "#ffc107",
  green: "#198754",
  teal: "#20c997",
  cyan: "#0dcaf0",
};

const SCALE_TONES = {
  50: 95,
  100: 90,
  200: 80,
  300: 70,
  400: 60,
  500: 50,
  600: 40,
  700: 30,
  800: 20,
  900: 10,
  950: 5,
};

function rgbCsv(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function scaleFromArgb(argb) {
  const p = TonalPalette.fromInt(argb);
  /** @type {Record<string, string>} */
  const out = {};
  for (const [key, tone] of Object.entries(SCALE_TONES)) {
    out[key] = hexFromArgb(p.tone(tone));
  }
  return out;
}

function accentRoles(a1, a2, seed, hct) {
  const lightPrimary = seed.toLowerCase();
  return {
    light: {
      primary: lightPrimary,
      onPrimary: hct.tone >= 60 ? hexFromArgb(a1.tone(10)) : "#ffffff",
      primaryContainer: hexFromArgb(a1.tone(90)),
      onPrimaryContainer: hexFromArgb(a1.tone(10)),
      secondary: hexFromArgb(a2.tone(40)),
      onSecondary: "#ffffff",
      secondaryContainer: hexFromArgb(a2.tone(90)),
      onSecondaryContainer: hexFromArgb(a2.tone(10)),
    },
    dark: {
      primary: hexFromArgb(a1.tone(80)),
      onPrimary: hexFromArgb(a1.tone(20)),
      primaryContainer: hexFromArgb(a1.tone(30)),
      onPrimaryContainer: hexFromArgb(a1.tone(90)),
      secondary: hexFromArgb(a2.tone(80)),
      onSecondary: hexFromArgb(a2.tone(20)),
      secondaryContainer: hexFromArgb(a2.tone(30)),
      onSecondaryContainer: hexFromArgb(a2.tone(90)),
    },
  };
}

/** MD3 中性面：ground 用 surface；card/group 用更高 Tone 的容器面 */
function surfaceRoles(scheme, n1, isDark) {
  if (!isDark) {
    return {
      surface: hexFromArgb(scheme.surface),
      // T96：比 T99 更易看出色相，避免各色板 body 都像同一片灰白
      surfaceGround: hexFromArgb(n1.tone(96)),
      // T100 ≈ 卡片白底，仍带种子色相
      surfaceCard: hexFromArgb(n1.tone(100)),
      surfaceGroup: hexFromArgb(n1.tone(100)),
      surfaceVariant: hexFromArgb(scheme.surfaceVariant),
      onSurface: hexFromArgb(scheme.onSurface),
      onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
      outline: hexFromArgb(scheme.outline),
      outlineVariant: hexFromArgb(scheme.outlineVariant),
      inverseSurface: hexFromArgb(scheme.inverseSurface),
      inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
      background: hexFromArgb(n1.tone(96)),
      onBackground: hexFromArgb(scheme.onBackground),
      shadow: hexFromArgb(scheme.shadow),
      scrim: hexFromArgb(scheme.scrim),
    };
  }
  return {
    surface: hexFromArgb(scheme.surface),
    surfaceGround: hexFromArgb(scheme.surface),
    // 暗色抬升面：T12 / T17 ≈ surface-container / high
    surfaceCard: hexFromArgb(n1.tone(12)),
    surfaceGroup: hexFromArgb(n1.tone(17)),
    surfaceVariant: hexFromArgb(scheme.surfaceVariant),
    onSurface: hexFromArgb(scheme.onSurface),
    onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
    outline: hexFromArgb(scheme.outline),
    outlineVariant: hexFromArgb(scheme.outlineVariant),
    inverseSurface: hexFromArgb(scheme.inverseSurface),
    inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
    background: hexFromArgb(scheme.background),
    onBackground: hexFromArgb(scheme.onBackground),
    shadow: hexFromArgb(scheme.shadow),
    scrim: hexFromArgb(scheme.scrim),
  };
}

function schemeFromSeed(seed) {
  const argb = argbFromHex(seed);
  const core = CorePalette.of(argb);
  const hct = Hct.fromInt(argb);
  const theme = themeFromSourceColor(argb);
  const accents = accentRoles(core.a1, core.a2, seed, hct);
  const light = {
    ...accents.light,
    ...surfaceRoles(theme.schemes.light, core.n1, false),
  };
  const dark = {
    ...accents.dark,
    ...surfaceRoles(theme.schemes.dark, core.n1, true),
  };
  return {
    seed: seed.toLowerCase(),
    hct: {
      hue: +hct.hue.toFixed(1),
      chroma: +hct.chroma.toFixed(1),
      tone: +hct.tone.toFixed(1),
    },
    light,
    dark,
    scale: scaleFromArgb(argb),
  };
}

const palettes = Object.fromEntries(
  Object.entries(SEEDS).map(([id, seed]) => [id, schemeFromSeed(seed)]),
);

const dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(dir, "m3-palettes.generated.json");
writeFileSync(outPath, `${JSON.stringify(palettes, null, 2)}\n`);

for (const [id, p] of Object.entries(palettes)) {
  console.log(
    `${id}: ground L=${p.light.surfaceGround} D=${p.dark.surfaceGround} | primary L=${p.light.primary}`,
  );
}
console.log(`\nWrote ${outPath}`);

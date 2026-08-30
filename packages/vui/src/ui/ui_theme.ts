/**
 * 色板：Theme Studio 种子 = light primary；accent + surface/outline/onSurface
 * 均由 Material Color Utilities 按 MD3 推导（见 scripts/generate-m3-palettes.mjs）。
 * indigo / purple / blue / violet / red / orange / yellow / green / teal / cyan
 */
export const MMDA_COLOR_PALETTE_IDS = [
  "indigo",
  "purple",
  "blue",
  "violet",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "cyan",
] as const;

export type MmdaColorPalette = (typeof MMDA_COLOR_PALETTE_IDS)[number];

export interface MmdaColorPaletteOption {
  id: MmdaColorPalette;
  label: string;
  /** Theme Studio / 预览圆点色 */
  previewColor: string;
  /** Aura primitive scale used by the PrimeVue skin. */
  scale: Readonly<Record<string, string>>;
}

export const DEFAULT_COLOR_PALETTE: MmdaColorPalette = "purple";

/** 公共 UI 偏好 localStorage 前缀（`mmda/colorPalette` 等） */
export const MMDA_PREF_PREFIX = "mmda/";

export function mmdaPrefKey(key: string): string {
  return `${MMDA_PREF_PREFIX}${key}`;
}

/** 读偏好：只认 `mmda/{key}` */
export function readMmdaPref(
  key: string,
  storage: Pick<Storage, "getItem"> | undefined =
    typeof localStorage === "undefined" ? undefined : localStorage,
): string | null {
  return storage?.getItem(mmdaPrefKey(key)) ?? null;
}

export function writeMmdaPref(
  key: string,
  value: string,
  storage: Pick<Storage, "setItem"> | undefined =
    typeof localStorage === "undefined" ? undefined : localStorage,
): void {
  storage?.setItem(mmdaPrefKey(key), value);
}

export const MMDA_COLOR_PALETTES: readonly MmdaColorPaletteOption[] = [
  {
    id: "indigo",
    label: "靛蓝",
    previewColor: "#6610f2",
    scale: {
      50: "#f6eeff",
      100: "#e8ddff",
      200: "#cfbdff",
      300: "#b69cff",
      400: "#9d79ff",
      500: "#8553ff",
      600: "#6d22f9",
      700: "#5300cd",
      800: "#3a0093",
      900: "#22005d",
      950: "#150042",
    },
  },
  {
    id: "purple",
    label: "紫色",
    previewColor: "#6750a4",
    scale: {
      50: "#f6eeff",
      100: "#e9ddff",
      200: "#cfbcff",
      300: "#b69df7",
      400: "#9a83db",
      500: "#8069bf",
      600: "#6750a4",
      700: "#4f378a",
      800: "#381e72",
      900: "#22005d",
      950: "#160041",
    },
  },
  {
    id: "blue",
    label: "蓝色",
    previewColor: "#0d6efd",
    scale: {
      50: "#eef0ff",
      100: "#dae2ff",
      200: "#b1c5ff",
      300: "#87a9ff",
      400: "#588cff",
      500: "#0e6efd",
      600: "#0057ce",
      700: "#00419e",
      800: "#002c70",
      900: "#001946",
      950: "#000f31",
    },
  },
  {
    id: "violet",
    label: "紫罗兰",
    previewColor: "#6f42c1",
    scale: {
      50: "#f7edff",
      100: "#ebddff",
      200: "#d3bbff",
      300: "#bc99ff",
      400: "#a478f9",
      500: "#895ddd",
      600: "#7043c2",
      700: "#5726a8",
      800: "#3f008d",
      900: "#250059",
      950: "#18003f",
    },
  },
  {
    id: "red",
    label: "红色",
    previewColor: "#dc3545",
    scale: {
      50: "#ffedec",
      100: "#ffdad9",
      200: "#ffb3b2",
      300: "#ff8889",
      400: "#ff525e",
      500: "#dd3646",
      600: "#ba1830",
      700: "#92001f",
      800: "#680013",
      900: "#410008",
      950: "#2c0004",
    },
  },
  {
    id: "orange",
    label: "橙色",
    previewColor: "#fd7e14",
    scale: {
      50: "#ffede5",
      100: "#ffdbc8",
      200: "#ffb68a",
      300: "#ff8d3d",
      400: "#e66f00",
      500: "#be5b00",
      600: "#984700",
      700: "#743500",
      800: "#522300",
      900: "#321300",
      950: "#210a00",
    },
  },
  {
    id: "yellow",
    label: "黄色",
    previewColor: "#ffc107",
    scale: {
      50: "#ffefd4",
      100: "#ffdf9e",
      200: "#fabd00",
      300: "#d8a300",
      400: "#b78a00",
      500: "#977100",
      600: "#785900",
      700: "#5b4300",
      800: "#3f2e00",
      900: "#261a00",
      950: "#180f00",
    },
  },
  {
    id: "green",
    label: "绿色",
    previewColor: "#198754",
    scale: {
      50: "#c1ffd4",
      100: "#93f7ba",
      200: "#77da9f",
      300: "#5bbe86",
      400: "#3da36d",
      500: "#1a8855",
      600: "#006d41",
      700: "#00522f",
      800: "#00391f",
      900: "#002110",
      950: "#001508",
    },
  },
  {
    id: "teal",
    label: "青绿",
    previewColor: "#20c997",
    scale: {
      50: "#bcffe0",
      100: "#67fcc6",
      200: "#44dfab",
      300: "#0bc291",
      400: "#00a47a",
      500: "#008864",
      600: "#006c4f",
      700: "#00513a",
      800: "#003827",
      900: "#002116",
      950: "#00150c",
    },
  },
  {
    id: "cyan",
    label: "青色",
    previewColor: "#0dcaf0",
    scale: {
      50: "#daf5ff",
      100: "#b1ecff",
      200: "#33d7fe",
      300: "#00bbde",
      400: "#009ebd",
      500: "#00829c",
      600: "#00677c",
      700: "#004e5e",
      800: "#003642",
      900: "#001f27",
      950: "#001319",
    },
  },
] as const;

const PALETTE_IDS = new Set<string>(MMDA_COLOR_PALETTE_IDS);

export function isMmdaColorPalette(value: unknown): value is MmdaColorPalette {
  return typeof value === "string" && PALETTE_IDS.has(value);
}

export function resolveColorPalette(value: unknown): MmdaColorPalette {
  return isMmdaColorPalette(value) ? value : DEFAULT_COLOR_PALETTE;
}

export function readStoredColorPalette(
  storage: Pick<Storage, "getItem"> | undefined =
    typeof localStorage === "undefined" ? undefined : localStorage,
): MmdaColorPalette {
  return resolveColorPalette(readMmdaPref("colorPalette", storage));
}

export function colorPaletteOption(
  palette: MmdaColorPalette,
): MmdaColorPaletteOption {
  return MMDA_COLOR_PALETTES.find((option) => option.id === palette)!;
}

import { reactive } from "vue";

/** 一级轨全倍；二级栏只吃字号增量的 PANEL_GROW（与 theme.css --mmda-side-panel-grow 一致）。 */
const RAIL_BASE_PX = 72;
const PANEL_BASE_PX = 228;
const PANEL_GROW = 0.4;

export const syncfusionSkinState = reactive({
  fontRev: 0,
});

export function currentFontScaleRatio(): number {
  if (typeof document === "undefined") return 1;
  const raw =
    document.documentElement.style.getPropertyValue("--mmda-font-scale").trim() ||
    getComputedStyle(document.documentElement)
      .getPropertyValue("--mmda-font-scale")
      .trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function dockRailPx(): number {
  return Math.round(RAIL_BASE_PX * currentFontScaleRatio());
}

export function dockPanelPx(): number {
  const scale = currentFontScaleRatio();
  return Math.round(PANEL_BASE_PX * (1 + (scale - 1) * PANEL_GROW));
}

export function dockExpandedPx(): number {
  return dockRailPx() + dockPanelPx();
}

export function refreshSyncfusionSkin() {
  syncfusionSkinState.fontRev += 1;
}

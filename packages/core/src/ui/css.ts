/**
 * 产品 CSS 钩子前缀。改这里即可，不要在各控件里写死 mmda。
 * 样式表里的 `.mmda-` 需另跟（本模块只管 TS 拼出来的 class）。
 */
export const UI_CSS_PREFIX = 'mmda'

/** `uiCssClass('avatar')` → `mmda-avatar`；`uiCssClass('avatar', 'circle')` → `mmda-avatar--circle`。 */
export function uiCssClass(stem: string, modifier?: string): string {
  return modifier
    ? `${UI_CSS_PREFIX}-${stem}--${modifier}`
    : `${UI_CSS_PREFIX}-${stem}`
}

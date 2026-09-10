/**
 * 产品 CSS 钩子前缀。改这里即可，不要在各控件里写死 mmda。
 * 样式表里的 `.mmda-` 需另跟（本模块只管 TS 拼出来的 class）。
 */
export const UI_CSS_PREFIX = 'mmda'

/**
 * BEM：块 / 元素 / 修饰符。
 * - `uiCssClass('signin-form')` → `mmda-signin-form`
 * - `uiCssClass('signin-form', 'login')` → `mmda-signin-form__login`
 * - `uiCssClass('signin-form', 'login', 'busy')` → `mmda-signin-form__login--busy`
 * - `uiCssClass('button', undefined, 'danger')` → `mmda-button--danger`
 */
export function uiCssClass(
  block: string,
  element?: string | null,
  modifier?: string | null,
): string {
  let name = `${UI_CSS_PREFIX}-${block}`
  if (element) name += `__${element}`
  if (modifier) name += `--${modifier}`
  return name
}

/**
 * 块 + 若干块修饰符（`--`）。
 * `uiCssClasses('page-header', 'sticky')` → `mmda-page-header mmda-page-header--sticky`
 */
export function uiCssClasses(
  block: string,
  ...modifiers: Array<string | false | null | undefined>
): string {
  return [
    uiCssClass(block),
    ...modifiers
      .filter((m): m is string => Boolean(m))
      .map((m) => uiCssClass(block, undefined, m)),
  ].join(' ')
}

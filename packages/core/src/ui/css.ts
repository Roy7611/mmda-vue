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
 * `uiClassModifiers('page', 'sticky')` → `mmda-page mmda-page--sticky`
 */
export function uiClassModifiers(
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

/**
 * 把已有的 class 段合并成一个字符串：字符串原样、数组递归、假值丢掉。
 * 不造 BEM 名、不加 `mmda-` 前缀（那是 `uiCssClass` / `uiClassModifiers` 的事）。
 *
 * 用于"控件自算的 modifier class + 程序员给的 `className`"归一处：
 * `uiClassName(textInputModifierClasses(props), props.className)`
 */
export function uiClassName(...parts: unknown[]): string {
  const out: string[] = []
  const walk = (part: unknown): void => {
    if (Array.isArray(part)) {
      for (const item of part) walk(item)
      return
    }
    if (typeof part === 'string' && part !== '') out.push(part)
  }
  for (const part of parts) walk(part)
  return out.join(' ')
}

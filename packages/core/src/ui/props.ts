/**
 * chrome / 列表共用的轻量 props 底。无 Vue。
 *
 * - `class` / `style`：壳样式（接口字段名合法；读 `props.class`，不要解构绑定名）
 * - 索引签名：袋里可有 `htmlAttributes`（原生 id / data-* / aria-* / name），
 *   由皮肤各自透传（`htmlAttributesOf`）；不要整份 props spread 到厂商。
 *   同袋暂供皮肤双读 `modelValue` / `onUpdate:modelValue`；收掉双轨后再收紧。
 * - `placeholder` / `disabled` 是控件具名，不进 `htmlAttributes`。
 */
export type UiColorRole =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'

export type UiPosition = 'left' | 'right' | 'top' | 'bottom'

/**
 * 可盒子化的标量（兼容 Vue ref / 普通 `{ value }`）。
 * core 不 import vue。
 */
export type UiBoxed<T> = T | { value: T }

export function unboxed<T>(raw: UiBoxed<T> | null | undefined): T | undefined {
  if (raw == null) return undefined
  if (typeof raw === 'object' && 'value' in raw) return (raw as { value: T }).value
  return raw as T
}

export interface UiProps {
  class?: unknown
  style?: unknown
  [key: string]: unknown
}

/** 落到真实 input / 根节点的 HTML 属性。读 UiProps 袋键 `htmlAttributes`；皮肤透传，不要改名。 */
export type HtmlAttributes = Record<string, string>

export function htmlAttributesOf(props?: UiProps): HtmlAttributes {
  return (props?.htmlAttributes as HtmlAttributes | undefined) ?? {}
}

/** 袋键回调（如 `onUpdate:modelValue`）。索引签名下不是函数类型。 */
export function callUiPropFn(
  props: UiProps | undefined,
  key: string,
  ...args: unknown[]
): void {
  const fn = props?.[key]
  if (typeof fn === 'function') {
    ;(fn as (...a: unknown[]) => void)(...args)
  }
}

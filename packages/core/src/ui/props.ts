import { isNullOrUndefined } from '../utils/is'
import { uiClassName } from './css'

/**
 * chrome / 列表共用的轻量 props 底。无 Vue。
 *
 * - `class` / `style`：壳样式（接口字段名合法；读 `props.class`，不要解构绑定名）
 * - 索引签名：袋里可有 `htmlAttributes`（原生 id / data-* / aria-* / name），
 *   由皮肤各自透传（`htmlAttributesOf`）；不要整份 props spread 到厂商。
 *   `modelValue` / `onUpdate:modelValue` 由 vui 的 emit* 读写，不要在 core factory 里调。
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
export function callUiBagFn(
  props: UiProps | undefined,
  key: string,
  ...args: unknown[]
): void {
  const fn = props?.[key]
  if (typeof fn === 'function') {
    ;(fn as (...a: unknown[]) => void)(...args)
  }
}

export function hasProp(name: string, props?: UiProps): boolean {
  return props != null && !isNullOrUndefined(props[name])
}

export function hasPropEx<T>(name: string, value: T, props?: UiProps): boolean {
  return props != null && props[name] === value
}

export function getProp<T>(
  name: string,
  props?: UiProps,
  remove = false,
): T | undefined {
  if (!hasProp(name, props)) return undefined
  const value = props![name] as T
  if (remove) delete props![name]
  return value
}

export function addProp<T>(name: string, value: T, props: UiProps = {}): UiProps {
  props[name] = value
  return props
}

export function addDefaultProp<T>(
  name: string,
  value: T,
  props: UiProps = {},
): UiProps {
  if (!hasProp(name, props)) props[name] = value
  return props
}

export function addDefaultProps(
  addingProps: UiProps,
  props: UiProps = {},
): UiProps {
  for (const [name, value] of Object.entries(addingProps)) {
    if (!hasProp(name, props)) props[name] = value
  }
  return props
}

export function ignoreNullishProps(props: UiProps): UiProps {
  for (const name of Object.keys(props)) {
    if (isNullOrUndefined(props[name])) delete props[name]
  }
  return props
}

export function copyProps(
  dest: UiProps,
  src: UiProps,
  names: string[],
  ignoreNullish = true,
): void {
  for (const name of names) {
    if (!ignoreNullish || !isNullOrUndefined(src[name])) dest[name] = src[name]
  }
}

export function selectProps(
  src: UiProps,
  names: string[],
  ignoreNullish = true,
): UiProps {
  const dest: UiProps = {}
  copyProps(dest, src, names, ignoreNullish)
  return dest
}

/** 归一到渲染前的 style：普通对象（Vue / React 都只吃对象）。 */
export type UiStyle = Record<string, string | number>

/**
 * 袋归一到"渲染前标准形态"——框架无关，`h` 与 `createElement` 都能直接吃。
 *
 * - `props`：具名参数 + `onXxx` 回调（`class` / `style` / `htmlAttributes` 已摘走，
 *   Vue 专属的 `onUpdate` / `onUpdate:modelValue` 别名被滤掉）；
 * - `attributes`：袋键 `htmlAttributes` 压平后的 DOM 属性表（键取两个运行时同名的那些）；
 * - `className`：已收成字符串（袋 `class` 允许数组，见 `uiClassName`）；
 * - `style`：已收成对象（字符串 style 会被解析，React 见字符串 style 会抛错）。
 *
 * 实测依据见 [`ui_prop_channels_design.md`](../../docs/ui/ui_prop_channels_design.md)。
 */
export interface UiRenderProps<TProps extends UiProps = UiProps> {
  props: TProps
  attributes: HtmlAttributes
  className?: string
  style?: UiStyle
}

/** 通道外的键：袋 `class` / `style` / 袋键 `htmlAttributes`。 */
const UI_ATTR_KEYS = new Set(['class', 'style', 'htmlAttributes'])

/** Vue 的 v-model 别名，不进标准形态（React 认不出，会告警并忽略）。 */
function isVueModelAlias(key: string): boolean {
  return key === 'onUpdate' || key.startsWith('onUpdate:')
}

/** 袋 → 渲染前标准形态。拆分规则只写在这里。 */
export function uiRenderProps<TProps extends UiProps = UiProps>(
  props?: TProps,
): UiRenderProps<TProps> {
  const bag: UiProps = props ?? {}
  const named: UiProps = {}
  for (const [key, value] of Object.entries(bag)) {
    if (UI_ATTR_KEYS.has(key) || isVueModelAlias(key)) continue
    // `for` 两个运行时都不吃原名（React 报 Did you mean `htmlFor`；Vue 渲成 htmlfor），
    // 规范名取 `htmlFor`，各运行时再换回自己的（vui → for）。
    named[key === 'for' ? 'htmlFor' : key] = value
  }

  const attributes: HtmlAttributes = { ...htmlAttributesOf(bag) }
  const className = uiClassName(unboxed(bag.class), attributes.class)
  if (className) delete attributes.class

  return {
    props: named as TProps,
    attributes,
    className: className || undefined,
    style: styleObjectOf(unboxed(bag.style)),
  }
}

/** `style` 归一到对象：对象浅拷（只留 string / number）、字符串解析、其余丢弃。 */
function styleObjectOf(value: unknown): UiStyle | undefined {
  if (typeof value === 'string') {
    const style: UiStyle = {}
    for (const part of value.split(';')) {
      const at = part.indexOf(':')
      if (at < 0) continue
      const name = part.slice(0, at).trim()
      const text = part.slice(at + 1).trim()
      if (name && text) style[name] = text
    }
    return Object.keys(style).length ? style : undefined
  }
  if (value == null || typeof value !== 'object') return undefined
  const style: UiStyle = {}
  for (const [name, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string' || typeof v === 'number') style[name] = v
  }
  return Object.keys(style).length ? style : undefined
}

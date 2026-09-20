import { uiClassName } from './css'

/**
 * chrome / 列表共用的轻量 props 底。无 Vue。
 *
 * 设计：[`vui_architecture.md`](../../../docs/design/vui_architecture.md) §1。三条规则：
 * - **无索引签名**：键名拼错当场报错；DOM 数据属性（`data-*` / `aria-*`）另有模板字面量放行。
 * - **只有壳样式三键**：`class` / `style` / `htmlAttributes` 在 `uiRenderProps` 里统一归一。
 * - **区域不进这里**：区域（`default` / `header` / …）走工厂 / Builder 的**第二参** `UiXxxSlots`。
 *   合并进 props 会让 Vue 把未被消费的函数键静默写成 DOM 属性（实测见设计文档 §1.1）。
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

/**
 * 壳样式的宽松写法：字符串 / 数组（可嵌套）/ 键值对象 / 假值。
 * 归一只有一处（`uiRenderProps`），语义同 Vue 的 `normalizeClass`。
 */
export type UiClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | UiClassValue[]
  | Record<string, unknown>

/** 渲染前的 style 一律是对象；字符串形式只在输入侧容忍。 */
export type UiStyle = Record<string, string | number>
export type UiStyleValue = string | UiStyle | null | undefined

/** DOM 属性值：白名单通道只收标量（函数 / 对象永远不进 DOM 属性，见 `uiRenderProps`）。 */
export type HtmlAttributeValue = string | number | boolean

/** 落到真实 input / 根节点的 HTML 属性：袋键 `htmlAttributes` 或顶层 `data-*` / `aria-*`。 */
export type HtmlAttributes = Record<string, HtmlAttributeValue>

/**
 * 所有控件具名入参的底：只有壳样式三键 + DOM 数据属性，**没有 `[key: string]` 索引签名**。
 * 确需灵活键的控件在自己的 `UiXxxProps` 里显式声明。
 */
export interface UiProps {
  class?: UiClassValue
  style?: UiStyleValue
  /** ARIA 角色（如 `group` / `dialog`）：每个元素都可能用，属标准属性。 */
  role?: string
  /** 标签关联（label 的 `for`）：平台原名，vui 直传；rui 侧译成 `htmlFor`。 */
  for?: string
  htmlAttributes?: HtmlAttributes
  [key: `data-${string}` | `aria-${string}`]: unknown
}

/** 读袋键 `htmlAttributes`（压平前的原始表）。 */
export function htmlAttributesOf(props?: UiProps): HtmlAttributes {
  return props?.htmlAttributes ?? {}
}

/**
 * 袋 → 「渲染前标准形态」：框架无关，`h` / `createElement` / Svelte 都能直接吃。
 *
 * - `props`：具名成员 + `onXxx` + 归一后的 `class`（字符串）与 `style`（对象）。
 *   Vue 专属的 `onUpdate` / `onUpdate:modelValue` 别名被滤掉，取值归口 vui 的 `vueUpdateOf`。
 * - `attributes`：DOM 属性白名单通道 —— 袋键 `htmlAttributes` 压平 + 顶层 `data-*` / `aria-*`。
 *
 * 判定只写在这里（**控件无关**）：
 *
 * | 输入 | 去向 |
 * |---|---|
 * | `class`（数组 / 字符串 / 假值） | `props.class`，字符串（袋键 `htmlAttributes.class` 并进来） |
 * | `style`（对象 / 字符串） | `props.style`，对象 |
 * | 袋键 `htmlAttributes` | 压平进 `attributes` |
 * | 顶层 `data-*` / `aria-*`（标量） | `attributes` |
 * | `onUpdate` / `onUpdate:*` | 丢弃（Vue 形状，不进契约） |
 * | 其余（含函数 / 对象） | 原样进 `props`，**不进 `attributes`** |
 *
 * 「其余」不按值种类二次分流：core 在运行时**分不清**「控件声明的逐项渲染委托」（如
 * `itemRenderer`，必须留在 props 里给控件消费）与「游离函数键」——两者都是 `typeof === 'function'`。
 * core 只做**通道约束**：函数 / 对象永远不进 DOM 属性通道；是否消费由控件负责。
 */
export interface UiRenderProps<TProps extends UiProps = UiProps> {
  props: TProps
  attributes: HtmlAttributes
}

/** 通道外的键：袋 `class` / `style` / 袋键 `htmlAttributes`。 */
const UI_ATTR_KEYS = new Set(['class', 'style', 'htmlAttributes'])

/** Vue 的 v-model 别名，不进标准形态。 */
function isVueModelAlias(key: string): boolean {
  return key === 'onUpdate' || key.startsWith('onUpdate:')
}

/** 按名字就能确定是 DOM 属性的键。 */
function isDomDataKey(key: string): boolean {
  return key.startsWith('data-') || key.startsWith('aria-')
}

function isAttributeValue(value: unknown): value is HtmlAttributeValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

/** 袋 → 标准形态。拆分规则只写在这里。 */
export function uiRenderProps<TProps extends UiProps = UiProps>(
  props?: TProps,
): UiRenderProps<TProps> {
  const bag = (props ?? {}) as Record<string, unknown>
  const named: Record<string, unknown> = {}
  const attributes: HtmlAttributes = { ...htmlAttributesOf(props) }

  for (const [key, value] of Object.entries(bag)) {
    if (UI_ATTR_KEYS.has(key) || isVueModelAlias(key)) continue
    if (isDomDataKey(key)) {
      if (isAttributeValue(value)) attributes[key] = value
      continue
    }
    named[key] = value
  }

  const className = uiClassName(unboxed(bag.class), attributes.class)
  if (className) named.class = className
  delete attributes.class

  const style = styleObjectOf(unboxed(bag.style))
  if (style) named.style = style

  return { props: named as TProps, attributes }
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
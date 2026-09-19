import { uiRenderProps, type UiProps } from '@mmda/core'

/**
 * 袋 → `h` 能直接吃的 props。业主：vui。
 *
 * core 的标准形态用两个运行时都懂的名字（`className` / `htmlFor`，见 `uiRenderProps`），
 * Vue 这边只需把这两个名字换回自己的：`class` / `for`。其余键原样透传。
 *
 * 只 spread 到根节点 / 真实 input；不要整份 spread 到厂商控件。
 */
export function vueRenderProps(props?: UiProps): UiProps {
  const std = uiRenderProps(props)
  const out: UiProps = { ...std.props, ...std.attributes }
  if (std.className) out.class = std.className
  if (std.style) out.style = std.style
  if (out.htmlFor !== undefined) {
    out.for = out.htmlFor
    delete out.htmlFor
  }
  return out
}

/**
 * Vue v-model 写入回调：袋键 `onUpdate` → `onUpdate:modelValue`。
 *
 * core 契约里没有这两个键（那是 Vue 的 v-model 形状，见 `ui_prop_channels_design.md` 事件规范），
 * 所以取值归口只留这一处，不要再在控件/皮肤里各写一遍。
 */
export function vueUpdateOf<T = unknown>(
  props?: UiProps,
  name?: string,
): ((value: T) => void) | undefined {
  const fn = name
    ? props?.[`onUpdate:${name}`]
    : (props?.onUpdate ?? props?.['onUpdate:modelValue'])
  return typeof fn === 'function' ? (fn as (value: T) => void) : undefined
}

/** 控件自算的 class 段 + 程序员给的 class：Vue 侧合并成一份字符串。 */
export function vueClassName(...parts: unknown[]): string {
  return uiRenderProps({ class: parts }).className ?? ''
}

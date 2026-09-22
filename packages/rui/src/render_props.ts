import type { UiRenderProps, UiProps } from '@mmda/core'

/**
 * core 标准形态 → React createElement 入参。
 *
 * rui 只做两处键名映射（vui 是零翻译）：
 * - `props.class` → `className`
 * - `props.for` → `htmlFor`
 * - 其余 `props` + `attributes` 直传
 *
 * `attributes` 是标量通道（`htmlAttributes` 压平 + `data-*` / `aria-*`），可安全落在根 DOM。
 * `props` 里的非标量键（函数 / 对象）是给控件消费的，不应直传给原生元素。
 *
 * 设计见 {@link ../../docs/rui_plan.md rui_plan.md} 和 `docs/design/vui_architecture.md` §1.4。
 */
export function reactRenderProps<TProps extends UiProps = UiProps>(
  std: UiRenderProps<TProps>,
): Record<string, unknown> {
  const { class: className, for: htmlFor, ...restProps } = std.props
  return {
    ...restProps,
    ...std.attributes,
    ...(className != null ? { className: className as string } : {}),
    ...(htmlFor != null ? { htmlFor: htmlFor as string } : {}),
  }
}
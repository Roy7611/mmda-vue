import type { UiProps } from '../props'

/**
 * 关联选择字段 chrome（`factory.searchRelative`）的属性。
 *
 * 不承载选择弹窗/查询参数：`toSearch` 由 Logic 调 `context.select`，
 * 本控件只负责显示当前值并触发选择。
 */
export interface UiSearchRefProps extends UiProps {
  /** 当前值；显示时先经 `optionLabel` 或对象 label/name/text/id 抽取。 */
  modelValue: unknown
  /** 点击打开选择。由 Logic 调 `context.select` 后回写 `modelValue`。 */
  toSearch: (event?: Event) => void | Promise<unknown>
  optionLabel?: string | ((value: unknown) => string)
  dataKey?: string
  options?: unknown[]
  placeholder?: string
  onUpdate?: (value: unknown) => void
  onInput?: (value: string) => void
}

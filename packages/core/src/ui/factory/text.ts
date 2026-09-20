import type { UiProps } from '../props'
/**
 * 文本类控件（`textSpan` / `label` / `title` / `subtitle`）的属性。
 *
 * `text` 是文本内容；其余元素属性直接落到 `span` / `label` / `h2` / `h3` 上，
 * class / style / htmlAttributes 由皮肤透传。将来文本特有字段（截断、行数…）加在这里。
 */
export interface UiTextProps extends UiProps {
  text?: string
}

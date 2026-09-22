import { uiRenderProps, type UiProps } from '@mmda/core'
import { reactRenderProps } from '@mmda/rui'

/** 把 `UiProps` 折成可安全落在原生 DOM / Syncfusion 根节点上的 React props。 */
export function reactDomProps(props?: UiProps): Record<string, unknown> {
  if (!props) return {}
  return reactRenderProps(uiRenderProps(props))
}

/** 拼 class，过滤空值。 */
export function joinClass(...parts: unknown[]): string {
  return parts
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
    .trim()
}

/** 数字按像素，字符串原样，空值回退。 */
export function cssSize(
  value: string | number | undefined,
  fallback: string,
): string {
  if (value == null || value === '') return fallback
  return typeof value === 'number' ? `${value}px` : value
}

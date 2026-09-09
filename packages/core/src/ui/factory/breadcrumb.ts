import type { UiProps } from '../props'

export interface UiBreadcrumbItem {
  key?: string
  label: string
  icon?: string
  /** 可点则有；末级通常省略。路由 path，不是厂商 url */
  to?: string
}

export interface UiBreadcrumbProps extends UiProps {
  items: UiBreadcrumbItem[]
  /** 分隔符；默认交给厂商 */
  separator?: string
}

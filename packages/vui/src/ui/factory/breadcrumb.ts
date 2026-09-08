/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/breadcrumb/vue-3-getting-started
 *
 * chrome 导航路径走 factory.breadcrumb。模块链拼装仍走 Builder.buildModuleBreadcrumb。
 */
import type { PropData } from '../layout/layout'

export interface UiBreadcrumbItem {
  key?: string
  label: string
  icon?: string
  /** 可点则有；末级通常省略。路由 path，不是厂商 url */
  to?: string
}

export interface UiBreadcrumbProps extends PropData {
  items: UiBreadcrumbItem[]
  /** 分隔符；默认交给厂商 */
  separator?: string
}

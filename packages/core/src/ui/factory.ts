import type { MetaUi } from '../metaui/metaui_group'
import type { Pagination } from '../models/pagination'
import type { UiLayout } from './layout'

/**
 * Logic 拼控件用的工厂。皮肤实现类仍在 vui-*。
 * 复杂 view 走 UiBuilder.buildView，不要在此提供 selector。
 */
export interface UiFactory<TNode = any> {
  layout?: UiLayout<TNode>
  textSpan(text: string, props?: Record<string, unknown>): TNode
  button(props?: Record<string, unknown>): TNode
  buttonGroup(children: any, props?: Record<string, unknown>): TNode
  formField?(
    props: Record<string, unknown>,
    slots?: { default?: () => TNode },
  ): TNode
  table(
    rows: unknown[],
    metaUi: MetaUi,
    props?: Record<string, unknown>,
  ): TNode
  /** 分页条。第一参是结果 `Pagination`，`onPage` 写回 `searchParam.pager`。 */
  paginator?(
    pagination: Pagination,
    props?: Record<string, unknown>,
  ): TNode
  image?(src: string, props?: Record<string, unknown>): TNode
  datePicker?(props?: Record<string, unknown>): TNode
  numberInput?(props?: Record<string, unknown>): TNode
  searchForRelative?(props?: Record<string, unknown>): TNode
}

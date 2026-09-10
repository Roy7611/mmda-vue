import type { UiListProps } from './list'
import type { UiTreeViewProps } from './tree'

/**
 * 左树右表（Explorer）。
 * 替代旧 `UiTreeListViewProps` / `buildTreeListView`。
 * 不是单控件：Builder {@link import('../builder').UiBuilder.buildExplorerView} 拼两块 factory。
 */
export interface UiExplorerViewProps<T = any, TNode = any> {
  /** 与旧 viewKind 对齐；通常为 categoryList。 */
  viewKind?: string
  treeOption?:
    | UiTreeViewProps<T, TNode>
    | (() => UiTreeViewProps<T, TNode>)
  listOption?: UiListProps<T>
  /** 列表外键，对应树节点 id 字段。 */
  foreignKey?: string
  treeWidth?: string | number
  /** 左树顶过滤框。与列表搜索条区分。 */
  showTreeSearchBar?: boolean
}

/** @deprecated 用 {@link UiExplorerViewProps} */
export type UiTreeListViewProps<T = any, TNode = any> = UiExplorerViewProps<
  T,
  TNode
>

import type { UiListViewEmits, UiListViewPropsType, UiListViewSlots } from './ui_list'
import type { UiTreeViewPropsType } from './ui_tree'
import type { UiViewManyKind } from './ui_view'

export interface UiTreeListViewProps<T = any> {
  viewKind?: UiViewManyKind | string
  treeOption?: UiTreeViewPropsType<T> | (() => UiTreeViewPropsType<T>)
  listOption?: UiListViewPropsType<T>
  /** 列表外键，对应 `treeOption.fields.id`。 */
  foreignKey?: string
  treeWidth?: string | number
  /** 左树顶过滤框。与列表 `showSearchbar` 区分，内部传给树的 `showSearchBar`。 */
  showTreeSearchBar?: boolean
}

export type UiTreeListViewPropsType<T = any> = UiTreeListViewProps<T> &
  UiListViewEmits<T> &
  UiListViewSlots<T>

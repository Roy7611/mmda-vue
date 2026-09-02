import type { UiListViewEmits, UiListViewProps, UiListViewSlots } from './ui_list'
import type { UiTreeViewPropsType } from './ui_tree'

export interface UiTreeListViewProps<T = any> extends UiListViewProps<T> {
  tree?: UiTreeViewPropsType<T> | (() => UiTreeViewPropsType<T>)
  treeWidth?: string | number
}

export type UiTreeListViewPropsType<T = any> = UiTreeListViewProps<T> &
  UiListViewEmits<T> &
  UiListViewSlots<T>

import type { UiListViewEmits, UiListViewPropsType, UiListViewSlots } from '../builder/list_view'
import type { UiExplorerViewProps } from '@mmda/core'
import type { UiTreeViewProps } from './tree'
import type { UiViewManyKind } from '../../contexts/view'

export interface UiTreeListViewProps<T = any> extends UiExplorerViewProps<T> {
  viewKind?: UiViewManyKind | string
  treeOption?: UiTreeViewProps<T> | (() => UiTreeViewProps<T>)
  listOption?: UiListViewPropsType<T>
}

export type UiTreeListViewPropsType<T = any> = UiTreeListViewProps<T> &
  UiListViewEmits<T> &
  UiListViewSlots<T>

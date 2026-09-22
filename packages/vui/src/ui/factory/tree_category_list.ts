import type { VuiListViewEmits, VuiListViewPropsType, VuiListViewSlots } from '../builder/list_view'
import type { UiExplorerProps } from '@mmda/core'
import type { UiTreeViewProps } from './tree'
import type { UiViewManyKind } from '../../contexts/view'

export interface VuiTreeListViewProps<T = any> extends UiExplorerProps<T> {
  viewKind?: UiViewManyKind | string
  treeOption?: UiTreeViewProps<T> | (() => UiTreeViewProps<T>)
  listOption?: VuiListViewPropsType<T>
}

export type VuiTreeListViewPropsType<T = any> = VuiTreeListViewProps<T> &
  VuiListViewEmits<T> &
  VuiListViewSlots<T>

/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/treeview/vue-3-getting-started
 * API: https://ej2.syncfusion.com/vue/documentation/api/treeview/index-default
 *
 * chrome 导航树走 factory.tree。vui 名是 tree，不要 TreeView / ejs-treeview / NTree。
 * 不是 treeSelect（树下拉）、不是 treeGrid（多列表格）。没有 fieldFactory.tree。
 * buildTreeView 是 Builder 组合，不是厂商控件名。
 */
import type { VNodeChild } from 'vue'
import { uiCssClass } from '@mmda/core'
import type {
  UiTreeDropPosition,
  UiTreeFields,
  UiTreeProps,
  UiTreeViewProps,
} from '@mmda/core'

export type {
  UiTreeDropPosition,
  UiTreeFields,
  UiTreeMoveMeta,
  UiTreeProps,
  UiTreeSelectionMode,
  UiTreeViewProps,
} from '@mmda/core'

export {
  readTreeField,
  writeTreeField,
  treeIdOf,
  treeLabelOf,
  treeChildrenKey,
  treeChildrenOf,
  setTreeChildren,
  treeChildrenCountOf,
  treeKnownChildrenCountOf,
  treeChildrenLoaded,
  treeShouldLoadChildren,
  treeHasExpandableChildren,
  mapTreeNodes,
  filterMappedTree,
  selectedIdSet,
  flattenMappedTree,
  isTreeIconUrl,
  findMappedSrc,
  treeLabelFieldName,
  treeParentFieldName,
  collectNodeAndDescendantIds,
  findMappedNodeById,
  normalizeTreeDropPosition,
  treeDropParent,
  treeCannotDropOn,
  resolveMappedTreeDrop,
  detachTreeNode,
  moveTreeNode,
} from '@mmda/core'
export type { UiTreeMappedNode } from '@mmda/core'

export interface VuiTreeViewSlots<T = any> {
  header?: () => VNodeChild
  footer?: () => VNodeChild
  footerContent?: (node: T) => VNodeChild
}

export function treeSelectionModeOf(
  props: UiTreeProps = {},
): NonNullable<UiTreeProps['selectionMode']> {
  if (props.selectionMode === 'checkbox' || props.selectionMode === 'none') {
    return props.selectionMode
  }
  return 'single'
}

export function treeModifierClasses(props: UiTreeProps = {}): unknown[] {
  const mode = treeSelectionModeOf(props)
  return [
    uiCssClass('tree'),
    mode === 'checkbox' ? uiCssClass('tree', undefined, 'checkbox') : undefined,
    mode === 'none' ? uiCssClass('tree', undefined, 'none') : undefined,
    props.showIcon ? uiCssClass('tree', undefined, 'icons') : undefined,
    props.allowDragDrop ? uiCssClass('tree', undefined, 'drag') : undefined,
    props.class,
  ]
}

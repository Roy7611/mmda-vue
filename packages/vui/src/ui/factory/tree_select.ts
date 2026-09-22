/*
 * chrome 树下拉走 factory.treeSelect（EJ2 DropDownTree 别名 factory.dropDownTree）。
 * 字段 fieldFactory.treeSelect 译 MetaUiField 后再调本控件。
 */
import type { MetaUiField, MetaUiFieldRef } from '@mmda/core'
import type {UiProps} from '@mmda/core'
export {
  treeSelectNodesOf,
  isTreeSelectReference,
  treeSelectParentFieldOf,
  treeSelectPropsFromField,
  type TreeSelectFieldContext,
} from '@mmda/core'

export type {
  UiTreeSelectDisplay,
  UiTreeSelectLoadMode,
  UiTreeSelectProps,
  UiTreeSelectValue,
} from '@mmda/core'
import type {
  UiTreeSelectDisplay,
  UiTreeSelectProps,
  UiTreeSelectValue,
} from '@mmda/core'

export type TreeSelectLogic = {
  getRoots?: () => Promise<unknown[]>
  getChildren?: (parentId: string) => Promise<unknown[]>
}

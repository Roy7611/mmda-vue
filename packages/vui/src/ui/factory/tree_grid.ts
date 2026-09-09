import type {
  MetaUi,
  MetaUiGroup,
  UiTreeGridProps as CoreUiTreeGridProps,
} from '@mmda/core'
import type { VNode } from 'vue'
import type { UiListViewPropsType } from "../builder/list_view";
import type { UiGridPropsType, UiTableSkinExtras } from "./list";
import type { TreeBindShape, TreeSourceShape } from '../builder/tree_data'
import {
  detectChildrenKey,
  detectTreeSourceShape,
  isTreeDisplayShape,
  treeDataProvider,
  treeIdField,
} from '../builder/tree_data'

/** 树形表：core 可编一族 + 树装配字段。 */
export interface UiTreeGridProps<T = any>
  extends CoreUiTreeGridProps<T, VNode> {
  sourceShape?: TreeSourceShape
  bindShape?: TreeBindShape
}

export type UiTreeGridPropsType<T = any> = UiGridPropsType<T> &
  UiTreeGridProps<T> &
  UiTableSkinExtras<T>

export type UiTreeGridViewPropsType<T = any> = UiListViewPropsType<T> &
  UiTreeGridProps<T>

export function treeGridSpecFromGroup(group: MetaUiGroup, rows?: unknown[]) {
  const childrenKey = rows ? detectChildrenKey(rows) : undefined
  const nested =
    !!rows &&
    !!childrenKey &&
    detectTreeSourceShape(rows, childrenKey) === 'nested'
  const treeShape = isTreeDisplayShape(group.displayShape)
    ? group.displayShape
    : nested
      ? 'TREE'
      : undefined
  const shapeKey = group.shapeKey || (nested ? childrenKey : undefined)
  if (!isTreeDisplayShape(treeShape) || !shapeKey) return undefined
  const groupUi = group.groupUi
  const idField = treeIdField(treeShape, shapeKey, groupUi?.primaryKey)
  return {
    treeShape,
    shapeKey,
    idField,
    parentIdField: treeShape === 'TREE' && !nested ? shapeKey : undefined,
    sourceShape: nested ? ('nested' as const) : undefined,
    childrenKey: nested ? childrenKey : undefined,
    loadMode: 'full' as const,
  }
}

export function assembleTreeGridRows<T>(
  model: T[],
  metaUi: MetaUi,
  props: UiTreeGridPropsType<T> = {},
) {
  const treeShape = String(props.treeShape ?? 'TREE')
  const shapeKey = props.shapeKey ?? ''
  const idField =
    props.idField ?? treeIdField(treeShape, shapeKey, metaUi.primaryKey)
  const childrenKey = props.childrenKey ?? detectChildrenKey(model)
  const nested = detectTreeSourceShape(model, childrenKey) === 'nested'
  const assembled = treeDataProvider.assemble(model, {
    treeShape,
    shapeKey,
    idField,
    sourceShape: props.sourceShape ?? (nested ? 'nested' : undefined),
    bindShape: props.bindShape,
    childrenKey,
  })
  return { treeShape, shapeKey, idField, childrenKey, assembled }
}

export function listedTableFields(metaUi: MetaUi) {
  const listed = metaUi.getListedFields()
  return listed.length
    ? listed
    : metaUi.groups.filter((group) => !group.many).flatMap((group) => group.fields)
}

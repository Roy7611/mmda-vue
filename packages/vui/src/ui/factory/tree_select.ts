/*
 * chrome 树下拉走 factory.treeSelect（EJ2 DropDownTree 别名 factory.dropDownTree）。
 * 字段 fieldFactory.treeSelect 译 MetaUiField 后再调本控件。
 */
import { MetaOptionsShape, type MetaUiField, type MetaUiFieldRef } from '@mmda/core'
import type {UiProps} from '@mmda/core'
import { treeDataProvider } from '../builder/tree_data'
import {
  setTreeChildren,
  treeIdOf,
  treeShouldLoadChildren,
  type UiTreeFields,
} from './tree'

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

export type TreeSelectFieldContext = {
  getFieldValue: (field: MetaUiField | string) => unknown
  setFieldValue: (field: MetaUiField | string, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
  /** 树形实体的 Logic 才有 getRoots / getChildren；不是 EntityLogic 默认能力。 */
  logic?: any
}

export function treeSelectNodesOf<T>(props: UiTreeSelectProps<T>): T[] {
  const rows = Array.isArray(props.data) ? props.data : []
  if (props.treeShape && props.shapeKey) {
    return treeDataProvider.assemble(rows, {
      treeShape: props.treeShape,
      shapeKey: props.shapeKey,
      idField: props.fields?.id,
      childrenKey:
        typeof props.fields?.children === 'string'
          ? props.fields.children
          : undefined,
      bindShape: 'nestedChildren',
    }).roots
  }
  return rows
}

export function isTreeSelectReference(
  reference?: MetaUiFieldRef,
): boolean {
  return reference?.refOptionsShape === MetaOptionsShape.TREE
}

/** TREE 时父字段：`groupBy` 与 `refFlds[2]` 同一位置。 */
export function treeSelectParentFieldOf(
  reference?: MetaUiFieldRef,
): string | undefined {
  if (!isTreeSelectReference(reference)) return undefined
  return reference?.groupBy || reference?.refFlds[2]
}

function fieldTreeFields(
  field: MetaUiField
): UiTreeFields {
  const reference = field.reference
  const refFlds = reference?.refFlds ?? []
  const parentId =
        treeSelectParentFieldOf(reference)
  return {
    id: refFlds[0] ?? 'id',
    label: refFlds[1] ?? 'label',
    parentId,
    children: 'children',
    childrenCount: 'childrenCount',
  }
}

function scalarId(raw: unknown, field: MetaUiField): string | number | null {
  if (raw == null || raw === '') return null
  const reference = field.reference
  if (reference && typeof raw === 'object') {
    const value = reference.valueOf(raw)
    return value ?? null
  }
  if (typeof raw === 'object' && raw != null && 'id' in raw) {
    const id = (raw as { id?: unknown }).id
    return typeof id === 'string' || typeof id === 'number' ? id : null
  }
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return null
}

function fieldTreeValue(
  field: MetaUiField,
  raw: unknown,
  checkbox: boolean,
): UiTreeSelectValue {
  if (checkbox) {
    const list = Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw]
    return list
      .map((item) => scalarId(item, field))
      .filter((item): item is string | number => item != null)
  }
  return scalarId(raw, field)
}

function resolveTreeWriteback(
  field: MetaUiField,
  value: UiTreeSelectValue,
  fields: UiTreeFields,
): unknown {
  const rows: unknown[] = []
  const find = (id: string | number) =>
    rows.find((row) => treeIdOf(row, fields) === String(id))
  if (Array.isArray(value)) {
    const hits = value.map((id) => find(id) ?? id)
    return hits
  }
  if (value == null || value === '') return null
  return find(value) ?? value
}

export function treeSelectPropsFromField(
  field: MetaUiField,
  context: TreeSelectFieldContext
): UiTreeSelectProps {
  const fields = fieldTreeFields(field)
  const reference = field.reference
  const treeRef = isTreeSelectReference(reference)
  const parentField = fields.parentId
  const checkbox = false
  const cachedOptions =
    !reference?.hasOne && Array.isArray(reference?.refOptions)
      ? reference!.refOptions
      : undefined
  const sourceRows = treeRef && cachedOptions?.length ? cachedOptions : undefined
  const hasData = Array.isArray(sourceRows)
  const lazy = treeRef && Boolean(reference?.hasOne) && !hasData
  const treeShape =
    (treeRef ? 'TREE' : undefined)
  const shapeKey =
    (treeRef && typeof parentField === 'string' ? parentField : undefined)
  const data = hasData
    ? treeSelectNodesOf({
        data: sourceRows,
        fields,
        treeShape,
        shapeKey,
      })
    : []

  return {
    data,
    fields,
    value: fieldTreeValue(field, context.getFieldValue(field), checkbox),
    placeholder:
      field.placeholder,
    disabled:
      context.isFieldReadonly(field),
    selectionMode: checkbox ? 'checkbox' : 'single',
    loadMode: lazy ? 'lazy' : 'full',
    treeShape,
    shapeKey,
    loadRoots:
      lazy && typeof context.logic?.getRoots === 'function'
        ? () => context.logic!.getRoots!()
        : undefined,
    onExpand:
      lazy && typeof context.logic?.getChildren === 'function'
        ? async (node) => {
            if (!treeShouldLoadChildren(node, fields)) return
            const id = treeIdOf(node, fields)
            if (!id) return
            const kids = await context.logic!.getChildren!(id)
            setTreeChildren(node, kids, fields)
          }
        : undefined,
    onChange: (value) => {
      context.setFieldValue(
        field,
        resolveTreeWriteback(field, value, fields),
      )
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

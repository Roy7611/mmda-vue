/*
 * chrome 树下拉走 factory.treeSelect（EJ2 DropDownTree 别名 factory.dropDownTree）。
 * 字段 fldFactory.treeSelect 译 MetaUiField 后再调本控件。
 */
import type { VNodeChild } from 'vue'
import { MetaOptionsShape, type MetaUiField, type MetaUiFieldRef } from '@mmda/core'
import type { PropData } from '../layout/layout'
import { treeDataProvider } from '../builder/tree_data'
import {
  setTreeChildren,
  treeIdOf,
  treeShouldLoadChildren,
  type UiTreeFields,
} from './tree'

export type UiTreeSelectDisplay = 'text' | 'chips' | 'delimiter' | 'custom'
export type UiTreeSelectLoadMode = 'full' | 'lazy'
export type UiTreeSelectValue = string | number | null | Array<string | number>

export interface UiTreeSelectProps<T = any> extends PropData {
  data?: T[]
  fields?: UiTreeFields<T>
  value?: UiTreeSelectValue
  placeholder?: string
  disabled?: boolean
  /** 厂商弹层 filter bar。缺省 true */
  allowFiltering?: boolean
  selectionMode?: 'single' | 'checkbox'
  showClear?: boolean
  selectedDisplay?: UiTreeSelectDisplay
  delimiter?: string
  popupHeight?: string | number
  popupWidth?: string | number
  showSelectAll?: boolean
  selectAllLabel?: string
  header?: () => VNodeChild
  item?: (node: T) => VNodeChild
  selected?: (nodes: T[]) => VNodeChild
  loadMode?: UiTreeSelectLoadMode
  onExpand?: (node: T) => void | Promise<void>
  loadRoots?: () => T[] | Promise<T[]>
  treeShape?: string
  shapeKey?: string
  onChange?: (value: UiTreeSelectValue) => void
}

export type TreeSelectLogic = {
  getRoots?: () => Promise<unknown[]>
  getChildren?: (parentId: string) => Promise<unknown[]>
}

export type TreeSelectFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
  /** 树形实体的 Logic 才有这两方法；不是 EntityLogic 默认能力。 */
  logic?: TreeSelectLogic
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
  field: MetaUiField,
  extra: PropData,
): UiTreeFields {
  const extraFields = extra.fields as UiTreeFields | undefined
  const reference = field.reference
  const refFlds = reference?.refFlds ?? []
  const parentId =
    extraFields?.parentId ??
    (typeof extra.shapeKey === 'string' ? extra.shapeKey : undefined) ??
    treeSelectParentFieldOf(reference)
  return {
    id: extraFields?.id ?? refFlds[0] ?? 'id',
    label: extraFields?.label ?? refFlds[1] ?? 'label',
    parentId,
    children: extraFields?.children ?? 'children',
    childrenCount: extraFields?.childrenCount ?? 'childrenCount',
    icon: extraFields?.icon,
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
  extra: PropData,
  value: UiTreeSelectValue,
  fields: UiTreeFields,
): unknown {
  const rows = Array.isArray(extra.data) ? extra.data : []
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
  context: TreeSelectFieldContext,
  extra: PropData = {},
): UiTreeSelectProps {
  const fields = fieldTreeFields(field, extra)
  const reference = field.reference
  const treeRef = isTreeSelectReference(reference)
  const parentField = fields.parentId
  const checkbox = extra.selectionMode === 'checkbox'
  const cachedOptions =
    !reference?.hasOne && Array.isArray(reference?.refOptions)
      ? reference!.refOptions
      : undefined
  const sourceRows = Array.isArray(extra.data)
    ? (extra.data as unknown[])
    : treeRef && cachedOptions?.length
      ? cachedOptions
      : undefined
  const hasData = Array.isArray(sourceRows)
  const lazy =
    extra.loadMode === 'lazy' ||
    (treeRef &&
      Boolean(reference?.hasOne) &&
      !hasData &&
      extra.loadMode !== 'full')
  const treeShape =
    (extra.treeShape as string | undefined) ?? (treeRef ? 'TREE' : undefined)
  const shapeKey =
    (extra.shapeKey as string | undefined) ??
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
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    allowFiltering: extra.allowFiltering,
    selectionMode: checkbox ? 'checkbox' : 'single',
    showClear: extra.showClear,
    selectedDisplay: extra.selectedDisplay as UiTreeSelectDisplay | undefined,
    delimiter: extra.delimiter as string | undefined,
    popupHeight: extra.popupHeight as string | number | undefined,
    popupWidth: extra.popupWidth as string | number | undefined,
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel: extra.selectAllLabel as string | undefined,
    header: extra.header as UiTreeSelectProps['header'],
    item: extra.item as UiTreeSelectProps['item'],
    selected: extra.selected as UiTreeSelectProps['selected'],
    loadMode: lazy ? 'lazy' : 'full',
    treeShape,
    shapeKey,
    loadRoots:
      lazy && typeof context.logic?.getRoots === 'function'
        ? () => context.logic!.getRoots!()
        : extra.loadRoots as UiTreeSelectProps['loadRoots'],
    onExpand:
      lazy && typeof context.logic?.getChildren === 'function'
        ? async (node) => {
            if (!treeShouldLoadChildren(node, fields)) return
            const id = treeIdOf(node, fields)
            if (!id) return
            const kids = await context.logic!.getChildren!(id)
            setTreeChildren(node, kids, fields)
          }
        : (extra.onExpand as UiTreeSelectProps['onExpand']),
    onChange: (value) => {
      context.setFieldValue(
        field,
        resolveTreeWriteback(field, extra, value, fields),
      )
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

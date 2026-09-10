/**
 * 输入类扩展控件 Props — chips。
 * 无 Vue。
 */
import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import {
  applyMultiSelectSelection,
  multiSelectChromeOptionsOf,
  multiSelectItemsOf,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectSelectedKeysOf,
  resolveMultiSelectItems,
  type UiMultiSelectBindMode,
  type UiMultiSelectProps,
} from './multi_select'
import { type UiColorRole, type UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiChipsKind = 'action' | 'choice' | 'filter' | 'input'

export type UiChipItem = {
  label: string
  value?: string | number
  disabled?: boolean
  colorRole?: UiColorRole
  /** 前置图标（EJ2 leadingIconCss）。 */
  icon?: string
  /** 头像图（EJ2 avatarIconCss / leadingIconUrl）。 */
  avatarSrc?: string
  /** 头像字母（EJ2 avatarText）。 */
  avatarLabel?: string
  trailingIcon?: string
  outlined?: boolean
}

export interface UiChipsProps extends UiProps {
  items?: Array<string | UiChipItem>
  kind?: UiChipsKind
  selected?: string | number | Array<string | number>
  removable?: boolean
  disabled?: boolean
  colorRole?: UiColorRole
  outlined?: boolean
  onChange?: (
    selected: string | number | Array<string | number> | undefined,
  ) => void
  onClick?: (item: UiChipItem, index: number) => void
  onRemove?: (item: UiChipItem, index: number) => void
}

export function chipsModifierClasses(props: UiChipsProps): unknown[] {
  const kind = props.kind ?? 'action'
  const kindClass =
    kind !== 'action' ? uiCssClass('chips', undefined, kind) : undefined
  const removable =
    kind === 'input' || props.removable === true
      ? uiCssClass('chips', undefined, 'removable')
      : undefined
  return [uiCssClass('chips'), kindClass, removable, props.class]
}

export function chipItemModifierClasses(item: UiChipItem): unknown[] {
  const color = item.colorRole
    ? uiCssClass('chips', 'item', item.colorRole)
    : undefined
  const outlined = item.outlined
    ? uiCssClass('chips', 'item', 'outlined')
    : undefined
  return [color, outlined]
}

/** 字段 chips / chipSet；setFieldValue / isFieldReadonly 可缺（只读展示）。 */
export type ChipsFieldContext = Pick<UiFieldBindContext, 'getFieldValue'> &
  Partial<Pick<UiFieldBindContext, 'setFieldValue' | 'isFieldReadonly'>>

export function normalizeChipItem(item: string | UiChipItem): UiChipItem {
  if (typeof item === 'string') return { label: item, value: item }
  const label = item.label ?? String(item.value ?? '')
  return { ...item, label, value: item.value ?? label }
}

export function chipsKindOf(props: UiChipsProps): UiChipsKind {
  return props.kind ?? 'action'
}

export function isChipsRemovable(props: UiChipsProps): boolean {
  return chipsKindOf(props) === 'input' || props.removable === true
}

export function chipsItemsOf(props: UiChipsProps): UiChipItem[] {
  return (props.items ?? []).map((item) => {
    const n = normalizeChipItem(item)
    return {
      ...n,
      colorRole: n.colorRole ?? props.colorRole,
      outlined: n.outlined ?? props.outlined,
      disabled: n.disabled || props.disabled,
    }
  })
}

export function chipValueOf(item: UiChipItem, index: number): string | number {
  return item.value ?? item.label ?? index
}

export function chipsSelectedOf(
  props: UiChipsProps,
): string | number | Array<string | number> | undefined {
  if (props.selected !== undefined) return props.selected
  const kind = chipsKindOf(props)
  if (kind === 'choice' || kind === 'filter') {
    return props.modelValue as
      | string
      | number
      | Array<string | number>
      | undefined
  }
  return undefined
}

export function chipIsSelected(
  props: UiChipsProps,
  item: UiChipItem,
  index: number,
): boolean {
  const selected = chipsSelectedOf(props)
  if (selected == null) return false
  const value = chipValueOf(item, index)
  return Array.isArray(selected)
    ? selected.some((entry) => entry === value)
    : selected === value
}

export function toggleChipSelection(
  props: UiChipsProps,
  item: UiChipItem,
  index: number,
): string | number | Array<string | number> | undefined {
  const kind = chipsKindOf(props)
  const value = chipValueOf(item, index)
  if (kind === 'choice') return value
  if (kind !== 'filter') return chipsSelectedOf(props)
  const current = chipsSelectedOf(props)
  const list = Array.isArray(current)
    ? [...current]
    : current == null
      ? []
      : [current]
  const at = list.findIndex((entry) => entry === value)
  if (at >= 0) list.splice(at, 1)
  else list.push(value)
  return list
}


export function chipLabelsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: UiProps = {},
): string[] {
  const raw = context.getFieldValue(field, extra.row)
  const labelOf = (value: any) =>
    String(
      field.reference?.labelOf?.(value) ??
        value?.label ??
        value?.text ??
        value ??
        '',
    ).trim()
  if (raw == null || raw === '') return []
  if (Array.isArray(raw)) return raw.map(labelOf).filter(Boolean)
  return String(raw)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function chipsPropsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: UiProps = {},
): UiChipsProps {
  return {
    items:
      (extra.items as Array<string | UiChipItem> | undefined) ??
      chipLabelsFromField(field, context, extra),
    kind: extra.kind as UiChipsKind | undefined,
    selected: extra.selected as
      | string
      | number
      | Array<string | number>
      | undefined,
    removable: extra.removable === true ? true : undefined,
    disabled: extra.disabled as boolean | undefined,
    colorRole: extra.colorRole as UiColorRole | undefined,
    outlined: extra.outlined as boolean | undefined,
    onChange: extra.onChange as UiChipsProps['onChange'],
    onClick: extra.onClick as UiChipsProps['onClick'],
    onRemove: extra.onRemove as UiChipsProps['onRemove'],
    class: extra.class,
    htmlAttributes: extra.htmlAttributes as
      | Record<string, string>
      | undefined,
  }
}

function chipSetOptionsOf(field: MetaUiField, extra: UiProps): unknown[] {
  if (Array.isArray(extra.options)) return extra.options
  const reference = field.reference
  if (!reference || reference.hasOne) return []
  return reference.refOptions ?? []
}

function chipSetMultiSelectProps(
  field: MetaUiField,
  extra: UiProps,
  bindMode: UiMultiSelectBindMode,
  value: unknown,
): UiMultiSelectProps {
  return {
    value,
    options: chipSetOptionsOf(field, extra),
    bindMode,
    valueField: extra.valueField as string | undefined,
    labelField: extra.labelField as string | undefined,
    separator: extra.separator as string | undefined,
    reference: field.reference,
  }
}

function chipsFromOptions(ms: UiMultiSelectProps): UiChipItem[] {
  return multiSelectChromeOptionsOf(ms).map((item) => ({
    label: multiSelectOptionLabelOf(item, ms),
    value: multiSelectOptionKeyOf(item, ms),
  }))
}

function chipsFromSelected(ms: UiMultiSelectProps): UiChipItem[] {
  return multiSelectItemsOf(ms.value, ms).map((item) => ({
    label: multiSelectOptionLabelOf(item, ms),
    value: multiSelectOptionKeyOf(item, ms),
  }))
}

function chipSetReadonlyOf(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: UiProps,
): boolean {
  return (
    extra.disabled === true || context.isFieldReadonly?.(field) === true
  )
}

function writeChipSetSelection(
  field: MetaUiField,
  context: ChipsFieldContext,
  ms: UiMultiSelectProps,
  extra: UiProps,
  selected: string | number | Array<string | number> | undefined,
): void {
  const keys = Array.isArray(selected)
    ? selected
    : selected == null
      ? []
      : [selected]
  const bound = applyMultiSelectSelection(ms, resolveMultiSelectItems(keys, ms))
  context.setFieldValue?.(field, bound)
  if (typeof extra.onChange === 'function') extra.onChange(bound)
}

export function enumChipSetBindModeOf(
  raw: unknown,
  extra: UiProps = {},
): 'value_array' | 'join_text' {
  if (extra.bindMode === 'value_array' || extra.bindMode === 'join_text') {
    return extra.bindMode
  }
  return Array.isArray(raw) ? 'value_array' : 'join_text'
}

function chipSetPropsFromBindMode(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: UiProps,
  bindMode: UiMultiSelectBindMode,
): UiChipsProps {
  const raw = context.getFieldValue(field, extra.row)
  const ms = chipSetMultiSelectProps(field, extra, bindMode, raw)
  const readonly = chipSetReadonlyOf(field, context, extra)
  if (readonly) {
    return {
      items:
        (extra.items as Array<string | UiChipItem> | undefined) ??
        chipsFromSelected(ms),
      kind: (extra.kind as UiChipsKind | undefined) ?? 'action',
      disabled: true,
      colorRole: extra.colorRole as UiColorRole | undefined,
      outlined: extra.outlined as boolean | undefined,
      class: extra.class,
      htmlAttributes: extra.htmlAttributes as
        | Record<string, string>
        | undefined,
    }
  }
  return {
    items:
      (extra.items as Array<string | UiChipItem> | undefined) ??
      chipsFromOptions(ms),
    kind: (extra.kind as UiChipsKind | undefined) ?? 'filter',
    selected:
      (extra.selected as
        | string
        | number
        | Array<string | number>
        | undefined) ?? multiSelectSelectedKeysOf(ms),
    disabled: false,
    colorRole: extra.colorRole as UiColorRole | undefined,
    outlined: extra.outlined as boolean | undefined,
    onChange: (selected) =>
      writeChipSetSelection(field, context, ms, extra, selected),
    onClick: extra.onClick as UiChipsProps['onClick'],
    onRemove: extra.onRemove as UiChipsProps['onRemove'],
    class: extra.class,
    htmlAttributes: extra.htmlAttributes as
      | Record<string, string>
      | undefined,
  }
}

export function bitChipSetPropsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: UiProps = {},
): UiChipsProps {
  return chipSetPropsFromBindMode(field, context, extra, 'or_bits')
}

export function enumChipSetPropsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: UiProps = {},
): UiChipsProps {
  const raw = context.getFieldValue(field, extra.row)
  return chipSetPropsFromBindMode(
    field,
    context,
    extra,
    enumChipSetBindModeOf(raw, extra),
  )
}

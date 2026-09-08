/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/chips/types
 * Customization: https://ej2.syncfusion.com/vue/documentation/chips/customization
 *
 * chrome 走 factory.chips。
 * 字段：tags / chips 自由文本；enumChipSet 枚举多值；bitChipSet 按位勾选。
 * 不要 enumSetTags / BitTags。
 */
import type { MetaUiField } from '@mmda/core'
import type { UiColorRole } from '../../app/material'
import type { PropData } from '../layout/layout'
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

export interface UiChipsProps extends PropData {
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

export type ChipsFieldContext = {
  getFieldValue: (field: MetaUiField, row?: unknown) => unknown
  setFieldValue?: (field: MetaUiField, value: unknown) => void
  isFieldReadonly?: (field: MetaUiField | string) => boolean
}

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
  if (kind === 'choice' || kind === 'filter') return props.modelValue
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

export function emitChipsChange(
  props: UiChipsProps,
  selected: string | number | Array<string | number> | undefined,
): void {
  props.onChange?.(selected)
  props['onUpdate:modelValue']?.(selected)
  props.onUpdate?.(selected)
}

export function chipsModifierClasses(props: UiChipsProps): unknown[] {
  const kind = chipsKindOf(props)
  const kindClass = kind !== 'action' ? `mmda-chips--${kind}` : undefined
  const removable = isChipsRemovable(props)
    ? 'mmda-chips--removable'
    : undefined
  return ['mmda-chips', kindClass, removable, props.class]
}

export function chipItemModifierClasses(item: UiChipItem): unknown[] {
  const color = item.colorRole
    ? `mmda-chips__item--${item.colorRole}`
    : undefined
  const outlined = item.outlined ? 'mmda-chips__item--outlined' : undefined
  return [color, outlined]
}

export function syncfusionChipCssClass(item: UiChipItem): string {
  const role =
    item.colorRole && item.colorRole !== 'secondary'
      ? `e-${item.colorRole}`
      : undefined
  const outline = item.outlined ? 'e-outline' : undefined
  return [role, outline, ...chipItemModifierClasses(item)]
    .filter(Boolean)
    .join(' ')
}

export function naiveChipType(
  colorRole?: UiColorRole,
): 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error' {
  if (!colorRole || colorRole === 'secondary') return 'default'
  if (colorRole === 'danger') return 'error'
  return colorRole
}

export function chipLabelsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: PropData = {},
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
  extra: PropData = {},
): UiChipsProps {
  return {
    items: extra.items ?? chipLabelsFromField(field, context, extra),
    kind: extra.kind,
    selected: extra.selected,
    removable: extra.removable === true ? true : undefined,
    disabled: extra.disabled,
    colorRole: extra.colorRole,
    outlined: extra.outlined,
    onChange: extra.onChange,
    onClick: extra.onClick,
    onRemove: extra.onRemove,
    class: extra.class,
    htmlAttributes: extra.htmlAttributes,
  }
}

function chipSetOptionsOf(field: MetaUiField, extra: PropData): unknown[] {
  if (Array.isArray(extra.options)) return extra.options
  const reference = field.reference
  if (!reference || reference.hasOne) return []
  return reference.refOptions ?? []
}

function chipSetMultiSelectProps(
  field: MetaUiField,
  extra: PropData,
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
  extra: PropData,
): boolean {
  return extra.disabled === true || context.isFieldReadonly?.(field) === true
}

function writeChipSetSelection(
  field: MetaUiField,
  context: ChipsFieldContext,
  ms: UiMultiSelectProps,
  extra: PropData,
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
  extra: PropData = {},
): 'value_array' | 'join_text' {
  if (extra.bindMode === 'value_array' || extra.bindMode === 'join_text') {
    return extra.bindMode
  }
  return Array.isArray(raw) ? 'value_array' : 'join_text'
}

function chipSetPropsFromBindMode(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: PropData,
  bindMode: UiMultiSelectBindMode,
): UiChipsProps {
  const raw = context.getFieldValue(field, extra.row)
  const ms = chipSetMultiSelectProps(field, extra, bindMode, raw)
  const readonly = chipSetReadonlyOf(field, context, extra)
  if (readonly) {
    return {
      items: extra.items ?? chipsFromSelected(ms),
      kind: extra.kind ?? 'action',
      disabled: true,
      colorRole: extra.colorRole,
      outlined: extra.outlined,
      class: extra.class,
      htmlAttributes: extra.htmlAttributes,
    }
  }
  return {
    items: extra.items ?? chipsFromOptions(ms),
    kind: extra.kind ?? 'filter',
    selected: extra.selected ?? multiSelectSelectedKeysOf(ms),
    disabled: false,
    colorRole: extra.colorRole,
    outlined: extra.outlined,
    onChange: (selected) =>
      writeChipSetSelection(field, context, ms, extra, selected),
    onClick: extra.onClick,
    onRemove: extra.onRemove,
    class: extra.class,
    htmlAttributes: extra.htmlAttributes,
  }
}

export function bitChipSetPropsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: PropData = {},
): UiChipsProps {
  return chipSetPropsFromBindMode(field, context, extra, 'or_bits')
}

export function enumChipSetPropsFromField(
  field: MetaUiField,
  context: ChipsFieldContext,
  extra: PropData = {},
): UiChipsProps {
  const raw = context.getFieldValue(field, extra.row)
  return chipSetPropsFromBindMode(
    field,
    context,
    extra,
    enumChipSetBindModeOf(raw, extra),
  )
}

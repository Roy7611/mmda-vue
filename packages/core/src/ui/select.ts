import { hasBit } from '../extensions/number_extensions'
import type { MetaUiField, MetaUiFieldRef } from '../metaui/metaui_field'
import { MetaOptionsShape } from '../metaui/metaui_field'
import { EntityState } from '../models/entity'
import { MetaModel } from '../models/metamodel'
import type { UiOrientation } from './layout'
import type { UiFieldBindContext } from './field_factory'
import { callUiBagFn, type UiProps } from './props'
import { uiCssClass, UI_CSS_PREFIX } from './css'
import {
  selectButtonGroupSelected,
  selectButtonOptionLabel,
  selectButtonOptionValue,
} from './button'

export type UiSelectOption = {
  value: string | number
  label: string
  group?: string
  icon?: string
}

export type UiSelectSuggest = (
  query: string,
) => Promise<Array<string | UiSelectOption>>

export interface UiDropDownListProps extends UiProps {
  value?: string | number | null
  options?: Array<string | UiSelectOption>
  placeholder?: string
  disabled?: boolean
  allowFiltering?: boolean
  suggest?: UiSelectSuggest
  minLength?: number
  debounceDelay?: number
  onChange?: (value: string | number | null) => void
}

export function dropDownListModifierClasses(
  props: UiDropDownListProps,
): unknown[] {
  return [uiCssClass('dropdown-list'), props.class]
}

export interface UiComboBoxProps extends UiDropDownListProps {
  /** 允许自由文本；缺省 true */
  allowCustom?: boolean
}

export function comboBoxModifierClasses(props: UiComboBoxProps): unknown[] {
  const custom =
    props.allowCustom !== false
      ? uiCssClass('combobox', 'custom')
      : undefined
  return [uiCssClass('combobox'), custom, props.class]
}

export type UiMultiSelectBindMode =
  | 'item_array'
  | 'value_array'
  | 'join_text'
  | 'or_bits'

export type UiMultiSelectDisplay = 'chips' | 'text'

export interface UiMultiSelectProps extends UiProps {
  value?: unknown
  options?: unknown[]
  bindMode?: UiMultiSelectBindMode
  valueField?: string
  labelField?: string
  separator?: string
  display?: UiMultiSelectDisplay
  placeholder?: string
  disabled?: boolean
  allowFiltering?: boolean
  suggest?: UiSelectSuggest
  reference?: MetaUiFieldRef
  onChange?: (bound: unknown) => void
}

export function multiSelectModifierClasses(
  props: UiMultiSelectProps,
): unknown[] {
  const mode = props.bindMode ?? 'item_array'
  const display =
    props.display === 'text'
      ? uiCssClass('multi-select', 'text')
      : undefined
  return [
    uiCssClass('multi-select'),
    uiCssClass('multi-select', mode),
    display,
    props.class,
  ]
}

export interface UiRadioButtonGroupProps extends UiProps {
  value?: unknown
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  /** 缺省 horizontal */
  orientation?: UiOrientation
  disabled?: boolean
  name?: string
  onChange?: (value: unknown) => void
}

export function radioButtonGroupModifierClasses(
  props: UiRadioButtonGroupProps,
): unknown[] {
  return [
    uiCssClass('radiobuttongroup'),
    props.orientation === 'vertical'
      ? uiCssClass('radiobuttongroup', 'vertical')
      : undefined,
    props.disabled
      ? uiCssClass('radiobuttongroup', 'disabled')
      : undefined,
    props.class,
  ]
}

export interface UiCheckBoxListProps extends UiMultiSelectProps {
  showSelectAll?: boolean
  selectAllLabel?: string
}

export function checkBoxListModifierClasses(
  props: UiCheckBoxListProps,
): unknown[] {
  const mode = props.bindMode ?? 'item_array'
  const bits =
    mode === 'or_bits' ? uiCssClass('checkbox-list', 'bits') : undefined
  return [
    uiCssClass('checkbox-list'),
    bits,
    ...multiSelectModifierClasses(props).filter(
      (cls) =>
        cls !== uiCssClass('multi-select') &&
        cls !== uiCssClass('multi-select', mode),
    ),
  ]
}

export const MULTI_SELECT_SEPARATOR = ','

export function splitJoinText(bound: unknown, separator: string): string[] {
  if (Array.isArray(bound)) {
    return bound.map((item) => String(item).trim()).filter(Boolean)
  }
  if (bound == null || bound === '') return []
  return String(bound)
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function multiSelectBindModeOf(
  props: Pick<UiMultiSelectProps, 'bindMode'>,
): UiMultiSelectBindMode {
  return props.bindMode ?? 'item_array'
}

export function multiSelectValueFieldOf(
  props: Pick<UiMultiSelectProps, 'valueField'>,
): string {
  return props.valueField ?? 'value'
}

export function multiSelectLabelFieldOf(
  props: Pick<UiMultiSelectProps, 'labelField'>,
): string {
  return props.labelField ?? 'label'
}

export function multiSelectSeparatorOf(
  props: Pick<UiMultiSelectProps, 'separator'>,
): string {
  return props.separator ?? MULTI_SELECT_SEPARATOR
}

export function multiSelectOptionKeyOf(
  item: unknown,
  props: Pick<UiMultiSelectProps, 'valueField' | 'reference' | 'bindMode'>,
): string | number {
  if (item == null) return ''
  if (typeof item === 'string' || typeof item === 'number') return item
  const mode = multiSelectBindModeOf(props)
  const reference = props.reference
  if (reference && mode !== 'or_bits' && typeof item === 'object') {
    const keyed = reference.valueOf(item)
    if (keyed != null && keyed !== '') return keyed as string | number
  }
  const rec = item as Record<string, unknown>
  const field = multiSelectValueFieldOf(props)
  if (rec[field] != null && rec[field] !== '') {
    return rec[field] as string | number
  }
  if (rec.value != null && rec.value !== '') return rec.value as string | number
  return ''
}

export function multiSelectOptionLabelOf(
  item: unknown,
  props: Pick<
    UiMultiSelectProps,
    'labelField' | 'reference' | 'valueField' | 'bindMode'
  >,
): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  if (item == null) return ''
  const reference = props.reference
  if (reference && typeof item === 'object') {
    const label = reference.labelOf(item)
    if (label != null && label !== '') return String(label)
  }
  const rec = item as Record<string, unknown>
  const field = multiSelectLabelFieldOf(props)
  if (rec[field] != null) return String(rec[field])
  if (rec.label != null) return String(rec.label)
  const key = multiSelectOptionKeyOf(item, props)
  return key === '' ? '' : String(key)
}

export function multiSelectChromeOptionsOf(
  props: Pick<
    UiMultiSelectProps,
    'options' | 'bindMode' | 'valueField' | 'reference'
  >,
): unknown[] {
  const options = props.options ?? []
  if (multiSelectBindModeOf(props) !== 'or_bits') return options
  return options.filter((item) => {
    const bit = Number(multiSelectOptionKeyOf(item, props))
    return Number.isFinite(bit) && bit !== 0
  })
}

function findOption(
  key: unknown,
  props: UiMultiSelectProps,
): unknown | undefined {
  return (props.options ?? []).find(
    (item) =>
      multiSelectOptionKeyOf(item, props) === key ||
      String(multiSelectOptionKeyOf(item, props)) === String(key),
  )
}

export function multiSelectItemsOf(
  bound: unknown,
  props: UiMultiSelectProps,
): unknown[] {
  const mode = multiSelectBindModeOf(props)
  const options = multiSelectChromeOptionsOf(props)
  if (mode === 'item_array') {
    const list = Array.isArray(bound) ? bound : []
    return list.filter(
      (item) => !MetaModel.isEntity(item) || !MetaModel.deleted(item),
    )
  }
  if (mode === 'join_text') {
    return splitJoinText(bound, multiSelectSeparatorOf(props))
      .map((key) => findOption(key, props))
      .filter((item) => item != null)
  }
  if (mode === 'or_bits') {
    const mask = Number(bound ?? 0)
    return options.filter((item) => {
      const bit = Number(multiSelectOptionKeyOf(item, props))
      return Number.isFinite(bit) && bit !== 0 && hasBit(mask, bit)
    })
  }
  const keys = Array.isArray(bound) ? bound : bound == null ? [] : [bound]
  return keys
    .map((key) => findOption(key, props))
    .filter((item) => item != null)
}

export function multiSelectBoundOf(
  items: unknown[],
  props: UiMultiSelectProps,
): unknown {
  const mode = multiSelectBindModeOf(props)
  if (mode === 'item_array') return items
  if (mode === 'join_text') {
    return items
      .map((item) => String(multiSelectOptionKeyOf(item, props)))
      .filter(Boolean)
      .join(multiSelectSeparatorOf(props))
  }
  if (mode === 'or_bits') {
    let mask = 0
    for (const item of items) {
      const bit = Number(multiSelectOptionKeyOf(item, props))
      if (!Number.isFinite(bit) || bit === 0) continue
      mask |= bit
    }
    return mask
  }
  return items.map((item) => multiSelectOptionKeyOf(item, props))
}

export function multiSelectSelectedKeysOf(
  props: UiMultiSelectProps,
): Array<string | number> {
  const bound = props.value !== undefined ? props.value : props.modelValue
  return multiSelectItemsOf(bound, props)
    .map((item) => multiSelectOptionKeyOf(item, props))
    .filter((key) => key !== '')
}

export function resolveMultiSelectItems(
  keys: Array<string | number>,
  props: UiMultiSelectProps,
): unknown[] {
  const bound = props.value !== undefined ? props.value : props.modelValue
  const current = Array.isArray(bound) ? bound : []
  return keys
    .map((key) => {
      const option = findOption(key, props)
      if (option != null) return option
      return current.find(
        (item) =>
          multiSelectOptionKeyOf(item, props) === key ||
          String(multiSelectOptionKeyOf(item, props)) === String(key),
      )
    })
    .filter((item) => item != null)
}

function cloneSelectedEntity(item: unknown): Record<string, unknown> {
  const copy: Record<string, unknown> =
    item != null && typeof item === 'object'
      ? { ...(item as object) }
      : { value: item }
  copy.entityState = EntityState.CREATED
  return copy
}

export function applyMultiSelectSelection(
  props: UiMultiSelectProps,
  selectedItems: unknown[],
): unknown {
  if (multiSelectBindModeOf(props) !== 'item_array') {
    return multiSelectBoundOf(selectedItems, props)
  }
  const bound = props.value !== undefined ? props.value : props.modelValue
  const current = Array.isArray(bound) ? bound : []
  if (current.some((item) => MetaModel.isEntity(item))) {
    MetaModel.syncSelection(current as any[], selectedItems, {
      keyOf: (item) => multiSelectOptionKeyOf(item, props),
      createFrom: cloneSelectedEntity,
    })
    return current
  }
  return selectedItems
}

export function emitMultiSelectChange(
  props: UiMultiSelectProps,
  bound: unknown,
): void {
  props.onChange?.(bound)
  callUiBagFn(props, 'onUpdate:modelValue', bound)
  callUiBagFn(props, 'onUpdate', bound)
}

export function applyAndEmitMultiSelectKeys(
  props: UiMultiSelectProps,
  keys: Array<string | number>,
): void {
  const items = resolveMultiSelectItems(keys, props)
  emitMultiSelectChange(props, applyMultiSelectSelection(props, items))
}

export function withMultiSelectBindMode(
  props: UiMultiSelectProps,
  bindMode: UiMultiSelectBindMode,
): UiMultiSelectProps {
  return { ...props, bindMode }
}

function fieldOptionSource(field: MetaUiField, extra: UiProps): unknown[] {
  if (Array.isArray(extra.options)) return extra.options
  const reference = field.reference
  if (!reference || reference.hasOne) return []
  return reference.refOptions ?? []
}

export function multiSelectPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiMultiSelectProps {
  const bindMode =
    (extra.bindMode as UiMultiSelectBindMode | undefined) ?? 'item_array'
  return {
    value: context.getFieldValue(field),
    options: fieldOptionSource(field, extra),
    bindMode,
    valueField: extra.valueField as string | undefined,
    labelField: extra.labelField as string | undefined,
    separator: extra.separator as string | undefined,
    display: extra.display as UiMultiSelectDisplay | undefined,
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    allowFiltering: extra.allowFiltering as boolean | undefined,
    suggest: extra.suggest as UiSelectSuggest | undefined,
    reference: field.reference,
    onChange: (bound) => {
      if (bindMode === 'item_array') {
        const current = context.getFieldValue(field)
        if (current !== bound) context.setFieldValue(field, bound)
        else MetaModel.modify(context.model ?? {})
      } else {
        context.setFieldValue(field, bound)
      }
      if (typeof extra.onChange === 'function') extra.onChange(bound)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(bound)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

export function multiItemSelectPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'item_array',
  })
}

export function multiValueSelectPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'value_array',
  })
}

export function multiTextSelectPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'join_text',
  })
}

export function multiBitSelectPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'or_bits',
  })
}

export const SELECT_MIN_LENGTH = 1
export const SELECT_DEBOUNCE_MS = 300

export function normalizeSelectOption(
  item: string | UiSelectOption,
): UiSelectOption {
  if (typeof item === 'string') return { value: item, label: item }
  const value = item.value
  const label = item.label ?? (value != null ? String(value) : '')
  const option: UiSelectOption = { value, label }
  if (item.group != null && item.group !== '') option.group = item.group
  if (item.icon) option.icon = item.icon
  return option
}

export function selectOptionsOf(
  props: Pick<UiDropDownListProps, 'options'>,
): UiSelectOption[] {
  return (props.options ?? []).map((item) => normalizeSelectOption(item))
}

export function nestSelectOptionsByGroup(
  options: UiSelectOption[],
): Array<{ label: string; options: UiSelectOption[] }> {
  const groups = new Map<string, UiSelectOption[]>()
  const order: string[] = []
  for (const option of options) {
    const key = option.group ?? ''
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(option)
  }
  return order.map((label) => ({ label, options: groups.get(label)! }))
}

export function selectOptionsGrouped(options: UiSelectOption[]): boolean {
  return options.some((option) => option.group != null && option.group !== '')
}

export function selectOptionsHaveIcon(options: UiSelectOption[]): boolean {
  return options.some((option) => Boolean(option.icon))
}

export function dropDownListValueOf(
  props: UiDropDownListProps,
): string | number | null | undefined {
  if (props.value !== undefined) return props.value ?? null
  if (props.modelValue !== undefined) {
    const raw = props.modelValue
    if (typeof raw === 'string' || typeof raw === 'number') return raw
    return raw == null ? null : String(raw)
  }
  return undefined
}

export function emitDropDownListChange(
  props: UiDropDownListProps,
  value: string | number | null,
): void {
  props.onChange?.(value)
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
}

export function isSelectOptionsGroupedField(
  reference?: MetaUiFieldRef,
): boolean {
  if (!reference) return false
  if (reference.groupBy) return true
  return reference.refOptionsShape === MetaOptionsShape.GROUPED
}

function isChromeSelectOption(item: unknown): item is UiSelectOption {
  return (
    item != null &&
    typeof item === 'object' &&
    'value' in item &&
    'label' in item &&
    (item as UiSelectOption).value != null
  )
}

export function selectOptionFromSource(
  item: unknown,
  reference?: MetaUiFieldRef,
  grouped = false,
): UiSelectOption {
  if (typeof item === 'string' || typeof item === 'number') {
    return { value: item, label: String(item) }
  }
  if (reference && item != null && typeof item === 'object') {
    const value = reference.valueOf(item)
    const label = String(reference.labelOf(item) ?? '')
    const option: UiSelectOption = {
      value: (value ?? (isChromeSelectOption(item) ? item.value : '')) as
        | string
        | number,
      label,
    }
    if (grouped) {
      const group = String(reference.groupByFn(item) ?? '')
      if (group) option.group = group
    }
    const icon = (item as { icon?: unknown }).icon
    if (typeof icon === 'string' && icon) option.icon = icon
    return option
  }
  if (isChromeSelectOption(item)) return normalizeSelectOption(item)
  return { value: String(item ?? ''), label: String(item ?? '') }
}

export function selectFieldOptionSource(
  field: MetaUiField,
  extra: UiProps,
): unknown[] {
  if (Array.isArray(extra.options)) return extra.options
  const reference = field.reference
  if (!reference || reference.hasOne) return []
  return reference.refOptions ?? []
}

export function selectFieldValueOf(
  field: MetaUiField,
  raw: unknown,
): string | number | null {
  if (raw == null || raw === '') return null
  const reference = field.reference
  if (reference && typeof raw === 'object') {
    const value = reference.valueOf(raw)
    return value ?? null
  }
  if (typeof raw === 'object' && raw != null && 'value' in raw) {
    return (raw as UiSelectOption).value ?? null
  }
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return null
}

export function selectFieldWritebackOf(
  field: MetaUiField,
  extra: UiProps,
  value: string | number | null,
): unknown {
  if (value == null || value === '') return null
  const reference = field.reference
  const source = selectFieldOptionSource(field, extra)
  const hit = source.find((item) => {
    if (typeof item === 'string' || typeof item === 'number') return item === value
    if (reference && item != null && typeof item === 'object') {
      return reference.valueOf(item) === value
    }
    if (isChromeSelectOption(item)) return item.value === value
    return false
  })
  if (hit != null && typeof hit === 'object') return hit
  if (hit != null) return hit
  return value
}

function searchRelativeRows(result: unknown): unknown[] {
  if (Array.isArray(result)) return result
  if (result != null && typeof result === 'object' && 'selectOptions' in result) {
    const rows = (result as { selectOptions?: unknown }).selectOptions
    return Array.isArray(rows) ? rows : []
  }
  return []
}

export function dropDownListPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDropDownListProps {
  const reference = field.reference
  const grouped = isSelectOptionsGroupedField(reference)
  const source = selectFieldOptionSource(field, extra)
  const options = source.map((item) =>
    selectOptionFromSource(item, reference, grouped),
  )
  const remote = extra.remote === true || Boolean(reference?.hasOne)
  const suggest: UiSelectSuggest | undefined =
    typeof extra.suggest === 'function'
      ? (extra.suggest as UiSelectSuggest)
      : remote && context.searchRelative
        ? async (query) => {
            const result = await context.searchRelative!(field, query)
            return searchRelativeRows(result).map((row) =>
              selectOptionFromSource(row, reference, grouped),
            )
          }
        : undefined

  return {
    value: selectFieldValueOf(field, context.getFieldValue(field)),
    options,
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    allowFiltering: extra.allowFiltering as boolean | undefined,
    suggest,
    minLength: extra.minLength as number | undefined,
    debounceDelay: extra.debounceDelay as number | undefined,
    onChange: (value) => {
      context.setFieldValue(field, selectFieldWritebackOf(field, extra, value))
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

export function comboBoxValueOf(props: UiComboBoxProps) {
  return props.value !== undefined ? props.value ?? null : props.modelValue ?? null
}

export function emitComboBoxChange(
  props: UiComboBoxProps,
  value: string | number | null,
): void {
  props.onChange?.(value)
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
}

export function comboBoxAllowCustom(props: UiComboBoxProps): boolean {
  return props.allowCustom !== false
}

export function comboBoxPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiComboBoxProps {
  return {
    ...dropDownListPropsFromField(field, context, extra),
    allowCustom: extra.allowCustom as boolean | undefined,
  }
}

export function checkBoxListShowSelectAll(props: UiCheckBoxListProps): boolean {
  return props.showSelectAll !== false
}

export function checkBoxListSelectableOptions(
  props: UiCheckBoxListProps,
): unknown[] {
  return multiSelectChromeOptionsOf(props)
}

export function checkBoxListItemChecked(
  props: UiCheckBoxListProps,
  item: unknown,
): boolean {
  const key = multiSelectOptionKeyOf(item, props)
  return multiSelectSelectedKeysOf(props).some(
    (entry) => entry === key || String(entry) === String(key),
  )
}

export function checkBoxListSelectedCount(props: UiCheckBoxListProps): {
  selected: number
  total: number
} {
  const options = checkBoxListSelectableOptions(props)
  const selected = options.filter((item) =>
    checkBoxListItemChecked(props, item),
  ).length
  return { selected, total: options.length }
}

export function checkBoxListAllChecked(props: UiCheckBoxListProps): boolean {
  const { selected, total } = checkBoxListSelectedCount(props)
  return total > 0 && selected === total
}

export function checkBoxListIndeterminate(props: UiCheckBoxListProps): boolean {
  const { selected, total } = checkBoxListSelectedCount(props)
  return selected > 0 && selected < total
}

export function checkBoxListKeysAfterToggle(
  props: UiCheckBoxListProps,
  item: unknown,
  checked: boolean,
): Array<string | number> {
  const key = multiSelectOptionKeyOf(item, props)
  const keys = multiSelectSelectedKeysOf(props).filter(
    (entry) => entry !== key && String(entry) !== String(key),
  )
  if (checked && key !== '') keys.push(key)
  return keys
}

export function checkBoxListKeysAfterSelectAll(
  props: UiCheckBoxListProps,
): Array<string | number> {
  if (checkBoxListAllChecked(props)) return []
  return checkBoxListSelectableOptions(props)
    .map((item) => multiSelectOptionKeyOf(item, props))
    .filter((key) => key !== '')
}

export function emitCheckBoxListToggle(
  props: UiCheckBoxListProps,
  item: unknown,
  checked: boolean,
): void {
  applyAndEmitMultiSelectKeys(
    props,
    checkBoxListKeysAfterToggle(props, item, checked),
  )
}

export function emitCheckBoxListSelectAll(props: UiCheckBoxListProps): void {
  applyAndEmitMultiSelectKeys(props, checkBoxListKeysAfterSelectAll(props))
}

export function checkBoxListPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiCheckBoxListProps {
  return {
    ...multiSelectPropsFromField(field, context, {
      ...extra,
      bindMode: 'value_array',
    }),
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel:
      (extra.selectAllLabel as string | undefined) ??
      context.t?.('action.selectAll'),
  }
}

export function bitCheckBoxListPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiCheckBoxListProps {
  return {
    ...multiSelectPropsFromField(field, context, {
      ...extra,
      bindMode: 'or_bits',
    }),
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel:
      (extra.selectAllLabel as string | undefined) ??
      context.t?.('action.selectAll'),
  }
}

export function checkBoxListBoundPreview(
  props: UiCheckBoxListProps,
): unknown {
  return multiSelectBoundOf(
    multiSelectItemsOf(
      props.value !== undefined ? props.value : props.modelValue,
      props,
    ),
    props,
  )
}

export type RadioButtonGroupItem = {
  value: unknown
  label: string
}

let radioGroupSeq = 0

export function radioButtonGroupValueOf(
  props: UiRadioButtonGroupProps,
): unknown {
  if (props.value !== undefined) return props.value ?? null
  if (props.modelValue !== undefined) return props.modelValue ?? null
  return undefined
}

export function emitRadioButtonGroupChange(
  props: UiRadioButtonGroupProps,
  value: unknown,
): void {
  props.onChange?.(value)
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
}

export function radioButtonGroupNameOf(
  props: UiRadioButtonGroupProps,
): string {
  const html = props.htmlAttributes as Record<string, string> | undefined
  const named = props.name ?? html?.name
  if (named) return named
  radioGroupSeq += 1
  return `${UI_CSS_PREFIX}-radiobuttongroup-${radioGroupSeq}`
}

export function radioButtonGroupItemsOf(
  props: UiRadioButtonGroupProps,
): RadioButtonGroupItem[] {
  return (props.options ?? []).map((item) => ({
    value: selectButtonOptionValue(item, props.optionValue),
    label: selectButtonOptionLabel(item, props.optionLabel),
  }))
}

export function radioButtonGroupItemSelected(
  props: UiRadioButtonGroupProps,
  itemValue: unknown,
): boolean {
  return selectButtonGroupSelected(
    radioButtonGroupValueOf(props),
    itemValue,
    'single',
  )
}

export function radioButtonGroupPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiRadioButtonGroupProps {
  const reference = field.reference
  const grouped = isSelectOptionsGroupedField(reference)
  const source = selectFieldOptionSource(field, extra)
  const options: UiSelectOption[] = source.map((item) =>
    selectOptionFromSource(item, reference, grouped),
  )
  return {
    value: selectFieldValueOf(field, context.getFieldValue(field)),
    options,
    orientation: extra.orientation as UiRadioButtonGroupProps['orientation'],
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    name: (extra.name as string | undefined) ?? field.fieldName,
    onChange: (value) => {
      const scalar =
        value == null || value === ''
          ? null
          : typeof value === 'string' || typeof value === 'number'
            ? value
            : selectFieldValueOf(field, value)
      context.setFieldValue(field, selectFieldWritebackOf(field, extra, scalar))
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

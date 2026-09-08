/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/drop-down-list/getting-started
 *
 * chrome 封闭下拉走 factory.dropDownList。不要叫 dropdown（菜单 / Prime dropdown / Grid dropdownedit）。
 * 字段 fldFactory.dropDownList 译 MetaUiField 后再调本控件。
 */
import { MetaOptionsShape, type MetaUiField, type MetaUiFieldRef } from '@mmda/core'
import type { PropData } from '../layout/layout'

export const SELECT_MIN_LENGTH = 1
export const SELECT_DEBOUNCE_MS = 300

export type UiSelectOption = {
  value: string | number
  label: string
  /** 分组标题；缺省则不分组 */
  group?: string
  /** 前置图标 class / 图标名，与 chips、breadcrumb 的 icon 一致 */
  icon?: string
}

export type UiSelectSuggest = (
  query: string,
) => Promise<Array<string | UiSelectOption>>

export interface UiDropDownListProps extends PropData {
  value?: string | number | null
  options?: Array<string | UiSelectOption>
  placeholder?: string
  disabled?: boolean
  /** 本地或远程过滤。缺省 true */
  allowFiltering?: boolean
  suggest?: UiSelectSuggest
  minLength?: number
  debounceDelay?: number
  onChange?: (value: string | number | null) => void
}

export type DropDownListFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
  searchRelative?: (
    field: MetaUiField,
    searchWord?: string,
  ) => Promise<unknown>
}

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
  if (props.modelValue !== undefined) return props.modelValue ?? null
  return undefined
}

export function emitDropDownListChange(
  props: UiDropDownListProps,
  value: string | number | null,
): void {
  props.onChange?.(value)
  props['onUpdate:modelValue']?.(value)
  props.onUpdate?.(value)
}

export function dropDownListModifierClasses(
  props: UiDropDownListProps,
): unknown[] {
  return ['mmda-dropdown-list', props.class]
}

export function isSelectOptionsGroupedField(reference?: MetaUiFieldRef): boolean {
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
  extra: PropData,
): unknown[] {
  if (Array.isArray(extra.options)) return extra.options
  const reference = field.reference
  if (!reference || reference.hasOne) return []
  return reference.refOptions ?? []
}

export function selectFieldValueOf(field: MetaUiField, raw: unknown): string | number | null {
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
  extra: PropData,
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
  context: DropDownListFieldContext,
  extra: PropData = {},
): UiDropDownListProps {
  const reference = field.reference
  const grouped = isSelectOptionsGroupedField(reference)
  const source = selectFieldOptionSource(field, extra)
  const options = source.map((item) =>
    selectOptionFromSource(item, reference, grouped),
  )
  const remote =
    extra.remote === true || Boolean(reference?.hasOne)
  const suggest: UiSelectSuggest | undefined =
    typeof extra.suggest === 'function'
      ? extra.suggest
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
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    allowFiltering: extra.allowFiltering,
    suggest,
    minLength: extra.minLength,
    debounceDelay: extra.debounceDelay,
    onChange: (value) => {
      context.setFieldValue(field, selectFieldWritebackOf(field, extra, value))
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

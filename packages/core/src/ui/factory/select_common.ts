import type { MetaUiField, MetaUiFieldRef } from '../../metaui/metaui_field'
import { MetaOptionsShape } from '../../metaui/metaui_field'
import type { UiProps } from '../props'

export type UiSelectOption = {
  value: string | number
  label: string
  group?: string
  icon?: string
}

export type UiSelectSuggest = (
  query: string,
) => Promise<Array<string | UiSelectOption>>

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

export function selectOptionsOf(props: {
  options?: Array<string | UiSelectOption>
}): UiSelectOption[] {
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

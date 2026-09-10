import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'
import { uiCssClass } from '../css'
import {
  isSelectOptionsGroupedField,
  selectFieldOptionSource,
  selectFieldValueOf,
  selectFieldWritebackOf,
  selectOptionFromSource,
  type UiSelectOption,
  type UiSelectSuggest,
} from './select_common'

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

import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
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
  context: UiFieldBindContext
): UiDropDownListProps {
  const reference = field.reference
  const grouped = isSelectOptionsGroupedField(reference)
  const source = selectFieldOptionSource(field)
  const options = source.map((item) =>
    selectOptionFromSource(item, reference, grouped),
  )
  const remote = Boolean(reference?.hasOne)
    const suggest: UiSelectSuggest | undefined =
      remote && context.searchRelative
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
    placeholder: field.placeholder,
    disabled:
      context.isFieldReadonly(field),
    suggest,
    onChange: (value) => {
      context.setFieldValue(field, selectFieldWritebackOf(field, value))
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

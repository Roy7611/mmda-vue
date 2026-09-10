import type { MetaUiField, MetaUiFieldRef } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiProps } from '../props'

export type UiAutoCompleteSize = 'small' | 'large'

export type UiAutoCompleteOption = {
  value: string
  label: string
}

export type UiAutoCompleteSuggest = (
  query: string,
) => Promise<Array<string | UiAutoCompleteOption>>

/**
 * 联想文本框。提交的是输入字符串，不是实体。
 * enum → dropDownList；hasOne → searchBox。REF 仅作建议源。
 */
export interface UiAutoCompleteProps extends UiProps {
  /** 框内文本。与 textInput 同名。 */
  value?: string
  placeholder?: string
  disabled?: boolean
  size?: UiAutoCompleteSize
  options?: Array<string | UiAutoCompleteOption>
  suggest?: UiAutoCompleteSuggest
  /** 仅 ref（小表）。enum / hasOne 不要传。 */
  reference?: MetaUiFieldRef
  minLength?: number
  debounceDelay?: number
  highlight?: boolean
  suggestionCount?: number
  onUpdate?: (value: string) => void
}

export const AUTOCOMPLETE_MIN_LENGTH = 1
export const AUTOCOMPLETE_DEBOUNCE_MS = 300
export const AUTOCOMPLETE_SUGGESTION_COUNT = 20

export function autoCompleteModifierClasses(props: UiAutoCompleteProps): unknown[] {
  const size = props.size ? uiCssClass('autocomplete', props.size) : undefined
  const highlight = props.highlight
    ? uiCssClass('autocomplete', 'highlight')
    : undefined
  return [uiCssClass('autocomplete'), size, highlight, props.class]
}

export function normalizeAutoCompleteOption(
  item: string | UiAutoCompleteOption,
): UiAutoCompleteOption {
  if (typeof item === 'string') return { value: item, label: item }
  const label = item.label ?? item.value
  return { value: item.value ?? label, label }
}

/** 建议显示文本；REF 用 labelOf。 */
export function autoCompleteSuggestionLabels(
  props: UiAutoCompleteProps,
): string[] {
  if (props.options?.length) {
    return props.options.map((item) => normalizeAutoCompleteOption(item).label)
  }
  const reference = props.reference
  if (reference?.isRef) {
    return (reference.refOptions ?? []).map((option) =>
      String(reference.labelOf(option) ?? ''),
    )
  }
  return []
}

export function autoCompleteBindValue(
  value: unknown,
  props?: UiAutoCompleteProps,
): string {
  if (value == null) return ''
  const reference = props?.reference
  if (reference?.isRef && typeof value === 'object') {
    return String(reference.labelOf(value) ?? '')
  }
  return String(value)
}


export function routeAutoCompleteField(
  field: Pick<MetaUiField, 'reference'>,
): 'dropDownList' | 'searchBox' | 'autoComplete' {
  const reference = field.reference
  if (reference?.isEnum) return 'dropDownList'
  if (reference?.hasOne) return 'searchBox'
  return 'autoComplete'
}

export function autoCompletePropsFromField(
  field: MetaUiField,
  extra: UiProps = {},
): UiAutoCompleteProps {
  const maxLength =
    field.maxLength != null ? String(field.maxLength) : undefined
  return {
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    options: extra.options as UiAutoCompleteProps['options'],
    suggest: extra.suggest as UiAutoCompleteProps['suggest'],
    reference: field.reference?.isRef ? field.reference : undefined,
    minLength: extra.minLength as number | undefined,
    debounceDelay: extra.debounceDelay as number | undefined,
    highlight: extra.highlight as boolean | undefined,
    suggestionCount: extra.suggestionCount as number | undefined,
    size: extra.size as UiAutoCompleteProps['size'],
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...(maxLength ? { maxlength: maxLength } : {}),
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

import type { MetaUiField, MetaUiFieldRef } from '../metaui/metaui_field'
import { uiCssClass } from './css'
import type { UiFieldBindContext } from './field_factory'
import type { UiProps } from './props'
import { MULTI_SELECT_SEPARATOR, splitJoinText } from './select'

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

/**
 * 多枚 tag 联想。值是 separator join 的字符串。
 * 不要把 factory.autoComplete 改成 multiple。
 */
export interface UiTagAutoCompleteProps extends UiAutoCompleteProps {
  separator?: string
}

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

export function autoCompleteUpdateOf(
  props?: UiAutoCompleteProps,
): ((value: string) => void) | undefined {
  if (props?.onUpdate) return props.onUpdate
  const bag = props?.['onUpdate:modelValue']
  return typeof bag === 'function' ? (bag as (value: string) => void) : undefined
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

export function tagAutoCompleteSeparatorOf(
  props?: Pick<UiTagAutoCompleteProps, 'separator'>,
): string {
  return props?.separator ?? MULTI_SELECT_SEPARATOR
}

export function tagAutoCompleteItemsOf(
  value: unknown,
  props?: Pick<UiTagAutoCompleteProps, 'separator'>,
): string[] {
  return splitJoinText(value, tagAutoCompleteSeparatorOf(props))
}

export function tagAutoCompleteTextOf(
  items: Array<string | null | undefined>,
  props?: Pick<UiTagAutoCompleteProps, 'separator'>,
): string {
  return items
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .join(tagAutoCompleteSeparatorOf(props))
}

export function tagAutoCompleteAddItem(
  current: unknown,
  next: string,
  props?: Pick<UiTagAutoCompleteProps, 'separator'>,
): string[] {
  const items = tagAutoCompleteItemsOf(current, props)
  const tag = next.trim()
  if (!tag) return items
  if (items.some((item) => item === tag)) return items
  return [...items, tag]
}

export function tagAutoCompleteSuggestionLabels(
  props: UiTagAutoCompleteProps,
): string[] {
  return autoCompleteSuggestionLabels(props)
}

export function tagAutoCompleteNormalizeOption(
  item: string | UiAutoCompleteOption,
): UiAutoCompleteOption {
  return normalizeAutoCompleteOption(item)
}

export function tagAutoCompleteUpdateOf(
  props?: UiTagAutoCompleteProps,
): ((value: string) => void) | undefined {
  return autoCompleteUpdateOf(props)
}

export function emitTagAutoCompleteChange(
  props: UiTagAutoCompleteProps,
  items: string[],
): void {
  const text = tagAutoCompleteTextOf(items, props)
  tagAutoCompleteUpdateOf(props)?.(text)
}

export function tagAutoCompleteModifierClasses(
  props: UiTagAutoCompleteProps,
): unknown[] {
  const size = props.size
    ? uiCssClass('tag-autocomplete', props.size)
    : undefined
  return [uiCssClass('tag-autocomplete'), size, props.class]
}

export const TAG_AUTOCOMPLETE_MIN_LENGTH = AUTOCOMPLETE_MIN_LENGTH
export const TAG_AUTOCOMPLETE_DEBOUNCE_MS = AUTOCOMPLETE_DEBOUNCE_MS
export const TAG_AUTOCOMPLETE_SUGGESTION_COUNT = AUTOCOMPLETE_SUGGESTION_COUNT

export function tagAutoCompletePropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): { value: string; props: UiTagAutoCompleteProps } {
  const sep = extra as Pick<UiTagAutoCompleteProps, 'separator'>
  const value = tagAutoCompleteTextOf(
    tagAutoCompleteItemsOf(context.getFieldValue(field), sep),
    sep,
  )
  return {
    value,
    props: {
      placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
      disabled:
        (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
      options: extra.options as UiTagAutoCompleteProps['options'],
      suggest: extra.suggest as UiTagAutoCompleteProps['suggest'],
      reference: field.reference?.isRef ? field.reference : undefined,
      minLength: extra.minLength as number | undefined,
      debounceDelay: extra.debounceDelay as number | undefined,
      highlight: extra.highlight as boolean | undefined,
      suggestionCount: extra.suggestionCount as number | undefined,
      separator: extra.separator as string | undefined,
      onUpdate: (text) => {
        context.setFieldValue(field, text)
        if (typeof extra.onUpdate === 'function') extra.onUpdate(text)
        if (typeof extra.onChange === 'function') extra.onChange(text)
      },
      class: extra.class,
      htmlAttributes: {
        name: field.fieldName,
        id: field.fieldName,
        ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
      },
    },
  }
}

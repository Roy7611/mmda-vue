/*
 * 多枚 tag 联想输入。契约跟 AutoComplete，值是 join 字符串。
 * 不要把 factory.autoComplete 改成 multiple。
 */
import type { MetaUiField, MetaUiFieldRef } from '@mmda/core'
import type { PropData } from '../layout/layout'
import type {
  UiAutoCompleteOption,
  UiAutoCompleteSize,
  UiAutoCompleteSuggest,
} from './autocomplete'
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  autoCompleteSuggestionLabels,
  normalizeAutoCompleteOption,
} from './autocomplete'
import { MULTI_SELECT_SEPARATOR, splitJoinText } from './multi_select'

export interface UiTagAutoCompleteProps extends PropData {
  placeholder?: string
  disabled?: boolean
  size?: UiAutoCompleteSize
  options?: Array<string | UiAutoCompleteOption>
  suggest?: UiAutoCompleteSuggest
  reference?: MetaUiFieldRef
  minLength?: number
  debounceDelay?: number
  highlight?: boolean
  suggestionCount?: number
  separator?: string
  onUpdate?: (value: string) => void
}

export type TagAutoCompleteFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
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
  return props?.onUpdate ?? props?.['onUpdate:modelValue']
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
  const size = props.size ? `mmda-tag-autocomplete--${props.size}` : undefined
  return ['mmda-tag-autocomplete', size, props.class]
}

export const TAG_AUTOCOMPLETE_MIN_LENGTH = AUTOCOMPLETE_MIN_LENGTH
export const TAG_AUTOCOMPLETE_DEBOUNCE_MS = AUTOCOMPLETE_DEBOUNCE_MS
export const TAG_AUTOCOMPLETE_SUGGESTION_COUNT = AUTOCOMPLETE_SUGGESTION_COUNT

export function tagAutoCompletePropsFromField(
  field: MetaUiField,
  context: TagAutoCompleteFieldContext,
  extra: PropData = {},
): { value: string; props: UiTagAutoCompleteProps } {
  const value = tagAutoCompleteTextOf(
    tagAutoCompleteItemsOf(
      context.getFieldValue(field),
      extra as Pick<UiTagAutoCompleteProps, 'separator'>,
    ),
    extra as Pick<UiTagAutoCompleteProps, 'separator'>,
  )
  return {
    value,
    props: {
      placeholder: extra.placeholder ?? field.placeholder,
      disabled: extra.disabled ?? context.isFieldReadonly(field),
      options: extra.options,
      suggest: extra.suggest,
      reference: field.reference?.isRef ? field.reference : undefined,
      minLength: extra.minLength,
      debounceDelay: extra.debounceDelay,
      highlight: extra.highlight,
      suggestionCount: extra.suggestionCount,
      separator: extra.separator,
      onUpdate: (text) => {
        context.setFieldValue(field, text)
        if (typeof extra.onUpdate === 'function') extra.onUpdate(text)
        if (typeof extra.onChange === 'function') extra.onChange(text)
      },
      class: extra.class,
      htmlAttributes: {
        name: field.fieldName,
        id: field.fieldName,
        ...extra.htmlAttributes,
      },
    },
  }
}

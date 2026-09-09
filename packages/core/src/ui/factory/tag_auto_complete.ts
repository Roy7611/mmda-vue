import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  autoCompleteSuggestionLabels,
  autoCompleteUpdateOf,
  normalizeAutoCompleteOption,
  type UiAutoCompleteOption,
  type UiAutoCompleteProps,
} from './autocomplete'
import { MULTI_SELECT_SEPARATOR, splitJoinText } from './select_common'

/**
 * 多枚 tag 联想。值是 separator join 的字符串。
 * 不要把 factory.autoComplete 改成 multiple。
 */
export interface UiTagAutoCompleteProps extends UiAutoCompleteProps {
  separator?: string
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

import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  autoCompleteSuggestionLabels,
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

export function tagAutoCompleteModifierClasses(
  props: UiTagAutoCompleteProps,
): unknown[] {
  const size = props.size
    ? uiCssClass('tag-autocomplete', undefined, props.size)
    : undefined
  return [uiCssClass('tag-autocomplete'), size, props.class]
}

export const TAG_AUTOCOMPLETE_MIN_LENGTH = AUTOCOMPLETE_MIN_LENGTH
export const TAG_AUTOCOMPLETE_DEBOUNCE_MS = AUTOCOMPLETE_DEBOUNCE_MS
export const TAG_AUTOCOMPLETE_SUGGESTION_COUNT = AUTOCOMPLETE_SUGGESTION_COUNT

/** 字段 → 标准形状。分隔符走默认（`MULTI_SELECT_SEPARATOR`），字段级覆盖留给调用方合并。 */
export function tagAutoCompletePropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
): UiTagAutoCompleteProps {
  return {
    value: tagAutoCompleteTextOf(
      tagAutoCompleteItemsOf(context.getFieldValue(field)),
    ),
    placeholder: field.placeholder,
    disabled: context.isFieldReadonly(field),
    reference: field.reference?.isRef ? field.reference : undefined,
    onChange: (text: string) => {
      context.setFieldValue(field, text)
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
    },
  }
}
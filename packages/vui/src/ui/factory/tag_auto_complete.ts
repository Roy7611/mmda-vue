import {
  tagAutoCompleteTextOf,
  type UiTagAutoCompleteProps,
} from '@mmda/core'
import { autoCompleteUpdateOf } from './autocomplete'

export type { UiTagAutoCompleteProps } from '@mmda/core'
export {
  TAG_AUTOCOMPLETE_DEBOUNCE_MS,
  TAG_AUTOCOMPLETE_MIN_LENGTH,
  TAG_AUTOCOMPLETE_SUGGESTION_COUNT,
  tagAutoCompleteAddItem,
  tagAutoCompleteItemsOf,
  tagAutoCompleteModifierClasses,
  tagAutoCompleteNormalizeOption,
  tagAutoCompletePropsFromField,
  tagAutoCompleteSeparatorOf,
  tagAutoCompleteSuggestionLabels,
  tagAutoCompleteTextOf,
} from '@mmda/core'

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

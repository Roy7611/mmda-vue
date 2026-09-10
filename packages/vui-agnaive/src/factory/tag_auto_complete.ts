import { h, reactive } from 'vue'
import { NSelect } from 'naive-ui'
import type { UiTagAutoCompleteProps } from '@mmda/core'
import { TAG_AUTOCOMPLETE_DEBOUNCE_MS, TAG_AUTOCOMPLETE_MIN_LENGTH, tagAutoCompleteItemsOf, tagAutoCompleteModifierClasses, tagAutoCompleteSuggestionLabels, tagAutoCompleteTextOf } from '@mmda/core'
import { tagAutoCompleteUpdateOf } from '@mmda/vui'
import { htmlAttributesOf } from '@mmda/vui'

export function createTagAutoComplete(props: UiTagAutoCompleteProps = {}) {
  const value = props.value
  const {
    options: _options,
    suggest,
    reference: _reference,
    minLength,
    debounceDelay,
    highlight: _highlight,
    suggestionCount: _suggestionCount,
    onUpdate: _onUpdate,
    class: _className,
    htmlAttributes,
    size: _size,
    placeholder,
    disabled,
    separator: _separator,
    value: _value,
    ...rest
  } = props

  const filterMin = minLength ?? TAG_AUTOCOMPLETE_MIN_LENGTH
  const local = tagAutoCompleteSuggestionLabels(props).map(label => ({
    label,
    value: label,
  }))
  const state = reactive({ options: local })
  const emit = tagAutoCompleteUpdateOf(props)
  let timer: ReturnType<typeof setTimeout> | undefined

  return h(NSelect, {
    ...rest,
    ...htmlAttributesOf(props),
    value: tagAutoCompleteItemsOf(props.modelValue ?? value, props),
    options: state.options,
    multiple: true,
    tag: true,
    filterable: true,
    placeholder,
    disabled,
    class: [...tagAutoCompleteModifierClasses(props)].flat(),
    onSearch: suggest
      ? (query: string) => {
          if (query.length < filterMin) {
            state.options = []
            return
          }
          const delay = debounceDelay ?? TAG_AUTOCOMPLETE_DEBOUNCE_MS
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            void Promise.resolve(suggest(query)).then(rows => {
              state.options = (rows ?? []).map(item =>
                typeof item === 'string'
                  ? { label: item, value: item }
                  : { label: item.label, value: item.value ?? item.label },
              )
            })
          }, delay)
        }
      : undefined,
    'onUpdate:value': (next: unknown) => {
      const items = Array.isArray(next)
        ? next.map(item => String(item ?? '').trim()).filter(Boolean)
        : []
      emit?.(tagAutoCompleteTextOf(items, props))
    },
  })
}

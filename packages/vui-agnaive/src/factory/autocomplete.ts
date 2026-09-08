import { h, reactive } from 'vue'
import { NAutoComplete } from 'naive-ui'
import type { UiAutoCompleteProps } from '@mmda/vui'
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  autoCompleteBindValue,
  autoCompleteModifierClasses,
  autoCompleteSuggestionLabels,
  autoCompleteUpdateOf,
  normalizeAutoCompleteOption,
} from '@mmda/vui'

export function createAutoComplete(
  value: string,
  props: UiAutoCompleteProps = {},
) {
  const minLength = props.minLength ?? AUTOCOMPLETE_MIN_LENGTH
  const suggestionCount =
    props.suggestionCount ?? AUTOCOMPLETE_SUGGESTION_COUNT
  const local = autoCompleteSuggestionLabels(props)
  const emit = autoCompleteUpdateOf(props)
  const state = reactive({
    options: local.slice(0, suggestionCount).map(label => ({ label, value: label })),
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  const {
    options: _options,
    suggest,
    reference: _reference,
    minLength: _minLength,
    debounceDelay,
    highlight: _highlight,
    suggestionCount: _suggestionCount,
    onUpdate: _onUpdate,
    class: _className,
    htmlAttributes,
    size: _size,
    placeholder,
    disabled,
    ...rest
  } = props

  const applyQuery = (query: string) => {
    if (query.length < minLength) {
      state.options = []
      return
    }
    if (suggest) {
      void Promise.resolve(suggest(query)).then(rows => {
        state.options = (rows ?? [])
          .map(item => {
            const option = normalizeAutoCompleteOption(item)
            return { label: option.label, value: option.label }
          })
          .slice(0, suggestionCount)
      })
      return
    }
    const q = query.toLowerCase()
    state.options = local
      .filter(label => label.toLowerCase().includes(q))
      .slice(0, suggestionCount)
      .map(label => ({ label, value: label }))
  }

  return h(NAutoComplete, {
    ...rest,
    ...htmlAttributes,
    value: autoCompleteBindValue(props.modelValue ?? value, props),
    options: state.options,
    placeholder,
    disabled,
    class: autoCompleteModifierClasses(props),
    'onUpdate:value': (next: string) => {
      emit?.(next ?? '')
      const delay = debounceDelay ?? AUTOCOMPLETE_DEBOUNCE_MS
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => applyQuery(next ?? ''), delay)
    },
  })
}

import { h, reactive } from "vue";
import AutoComplete from "primevue/autocomplete";
import type { UiTagAutoCompleteProps } from "@mmda/vui";
import {
  TAG_AUTOCOMPLETE_DEBOUNCE_MS,
  TAG_AUTOCOMPLETE_MIN_LENGTH,
  TAG_AUTOCOMPLETE_SUGGESTION_COUNT,
  htmlAttributesOf,
  tagAutoCompleteItemsOf,
  tagAutoCompleteModifierClasses,
  tagAutoCompleteSuggestionLabels,
  tagAutoCompleteTextOf,
  tagAutoCompleteUpdateOf,
} from "@mmda/vui";

export function createTagAutoComplete(
  value: string,
  props: UiTagAutoCompleteProps = {},
) {
  const minLength = props.minLength ?? TAG_AUTOCOMPLETE_MIN_LENGTH;
  const suggestionCount =
    props.suggestionCount ?? TAG_AUTOCOMPLETE_SUGGESTION_COUNT;
  const local = tagAutoCompleteSuggestionLabels(props);
  const emit = tagAutoCompleteUpdateOf(props);
  const state = reactive({ suggestions: [] as string[] });
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
    separator: _separator,
    ...rest
  } = props;

  return h(AutoComplete, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: tagAutoCompleteItemsOf(props.modelValue ?? value, props),
    suggestions: state.suggestions,
    multiple: true,
    typeahead: true,
    forceSelection: false,
    minLength,
    delay: debounceDelay ?? TAG_AUTOCOMPLETE_DEBOUNCE_MS,
    placeholder,
    disabled,
    class: [...tagAutoCompleteModifierClasses(props)].flat(),
    completeMethod: (event: { query: string }) => {
      const query = event.query ?? "";
      if (query.length < minLength) {
        state.suggestions = [];
        return;
      }
      if (suggest) {
        void Promise.resolve(suggest(query)).then((rows) => {
          state.suggestions = (rows ?? [])
            .map((item) =>
              typeof item === "string" ? item : String(item.label ?? item.value),
            )
            .slice(0, suggestionCount);
        });
        return;
      }
      const q = query.toLowerCase();
      state.suggestions = local
        .filter((label) => label.toLowerCase().includes(q))
        .slice(0, suggestionCount);
    },
    "onUpdate:modelValue": (next: unknown) => {
      const items = Array.isArray(next)
        ? next.map((item) => String(item ?? "").trim()).filter(Boolean)
        : [];
      emit?.(tagAutoCompleteTextOf(items, props));
    },
  });
}

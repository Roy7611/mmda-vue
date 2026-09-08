import { h, reactive } from "vue";
import AutoComplete from "primevue/autocomplete";
import type { UiAutoCompleteProps } from "@mmda/vui";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  autoCompleteBindValue,
  autoCompleteModifierClasses,
  autoCompleteSuggestionLabels,
  autoCompleteUpdateOf,
  normalizeAutoCompleteOption,
} from "@mmda/vui";

export function createAutoComplete(
  value: string,
  props: UiAutoCompleteProps = {},
) {
  const minLength = props.minLength ?? AUTOCOMPLETE_MIN_LENGTH;
  const suggestionCount =
    props.suggestionCount ?? AUTOCOMPLETE_SUGGESTION_COUNT;
  const local = autoCompleteSuggestionLabels(props);
  const emit = autoCompleteUpdateOf(props);
  const state = reactive({ suggestions: [] as string[] });
  const {
    options: _options,
    suggest,
    reference: _reference,
    minLength: _minLength,
    debounceDelay,
    highlight,
    suggestionCount: _suggestionCount,
    onUpdate: _onUpdate,
    class: _className,
    htmlAttributes,
    size: _size,
    placeholder,
    disabled,
    ...rest
  } = props;

  return h(AutoComplete, {
    ...rest,
    ...htmlAttributes,
    modelValue: autoCompleteBindValue(props.modelValue ?? value, props),
    suggestions: state.suggestions,
    dropdown: false,
    forceSelection: false,
    minLength,
    delay: debounceDelay ?? AUTOCOMPLETE_DEBOUNCE_MS,
    placeholder,
    disabled,
    inputProps: htmlAttributes,
    class: autoCompleteModifierClasses(props),
    completeMethod: (event: { query: string }) => {
      const query = event.query ?? "";
      if (query.length < minLength) {
        state.suggestions = [];
        return;
      }
      if (suggest) {
        void Promise.resolve(suggest(query)).then((rows) => {
          state.suggestions = (rows ?? [])
            .map((item: string | { label?: string; value?: string }) =>
              normalizeAutoCompleteOption(item as string | { value: string; label: string }).label,
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
      const text =
        next != null && typeof next === "object" && "label" in (next as object)
          ? String((next as { label: string }).label ?? "")
          : String(next ?? "");
      emit?.(text);
    },
  });
}

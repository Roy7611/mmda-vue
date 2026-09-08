import { h, reactive } from "vue";
import AutoComplete from "primevue/autocomplete";
import type { UiComboBoxProps, UiSelectOption } from "@mmda/vui";
import {
  SELECT_DEBOUNCE_MS,
  SELECT_MIN_LENGTH,
  comboBoxAllowCustom,
  comboBoxModifierClasses,
  comboBoxValueOf,
  emitComboBoxChange,
  htmlAttributesOf,
  normalizeSelectOption,
  selectOptionsOf,
} from "@mmda/vui";

export function createComboBox(props: UiComboBoxProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    placeholder,
    disabled,
    allowFiltering: _allowFiltering,
    allowCustom: _allowCustom,
    suggest,
    minLength,
    debounceDelay,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const local = selectOptionsOf(props);
  const state = reactive({ suggestions: [...local] });
  const filterMin = minLength ?? SELECT_MIN_LENGTH;
  const forceSelection = !comboBoxAllowCustom(props);

  const optionOf = (next: unknown): string | number | null => {
    if (next == null || next === "") return null;
    if (typeof next === "object" && next != null && "value" in next) {
      return (next as UiSelectOption).value ?? null;
    }
    return next as string | number;
  };

  return h(AutoComplete, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: comboBoxValueOf(props) ?? null,
    suggestions: state.suggestions,
    dropdown: true,
    forceSelection,
    optionLabel: "label",
    optionValue: "value",
    minLength: filterMin,
    delay: debounceDelay ?? SELECT_DEBOUNCE_MS,
    placeholder,
    disabled,
    class: [...comboBoxModifierClasses(props)].flat(),
    completeMethod: (event: { query: string }) => {
      const query = event.query ?? "";
      if (query.length < filterMin) {
        state.suggestions = [];
        return;
      }
      if (suggest) {
        void Promise.resolve(suggest(query)).then((rows) => {
          state.suggestions = (rows ?? []).map((item) =>
            normalizeSelectOption(item as string | UiSelectOption),
          );
        });
        return;
      }
      const q = query.toLowerCase();
      state.suggestions = local.filter(
        (option) =>
          option.label.toLowerCase().includes(q) ||
          String(option.value).toLowerCase().includes(q),
      );
    },
    "onUpdate:modelValue": (next: unknown) =>
      emitComboBoxChange(props, optionOf(next)),
  });
}

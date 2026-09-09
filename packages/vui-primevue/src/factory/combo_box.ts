import { h, reactive } from "vue";
import AutoComplete from "primevue/autocomplete";
import type { UiComboBoxProps, UiSelectOption } from "@mmda/core"
import { SELECT_DEBOUNCE_MS, SELECT_MIN_LENGTH, comboBoxAllowCustom, comboBoxModifierClasses, comboBoxValueOf, emitComboBoxChange, normalizeSelectOption, selectOptionsOf } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

function defineInputProps(props: UiComboBoxProps) {
  return {
    ...htmlAttributesOf(props),
    class: [...comboBoxModifierClasses(props)].flat(),
    disabled: props.disabled === true,
    placeholder: props.placeholder,
  };
}

export function createComboBox(props: UiComboBoxProps) {
  const local = selectOptionsOf(props);
  const state = reactive({ suggestions: [...local] });
  const filterMin = props.minLength ?? SELECT_MIN_LENGTH;
  const forceSelection = !comboBoxAllowCustom(props);

  const optionOf = (next: unknown): string | number | null => {
    if (next == null || next === "") return null;
    if (typeof next === "object" && next != null && "value" in next) {
      return (next as UiSelectOption).value ?? null;
    }
    return next as string | number;
  };

  const primeProps = {
    ...defineInputProps(props),
    modelValue: comboBoxValueOf(props) ?? null,
    suggestions: state.suggestions,
    dropdown: true,
    forceSelection,
    optionLabel: "label" as const,
    optionValue: "value" as const,
    minLength: filterMin,
    delay: props.debounceDelay ?? SELECT_DEBOUNCE_MS,
    completeMethod: (event: { query: string }) => {
      const query = event.query ?? "";
      if (query.length < filterMin) {
        state.suggestions = [];
        return;
      }
      if (props.suggest) {
        void Promise.resolve(props.suggest(query)).then((rows) => {
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
  };

  return h(AutoComplete, primeProps);
}

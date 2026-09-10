import { h, reactive } from "vue";
import Select from "primevue/select";
import type { UiDropDownListProps, UiSelectOption } from "@mmda/core"
import { SELECT_MIN_LENGTH, dropDownListModifierClasses, dropDownListValueOf, nestSelectOptionsByGroup, normalizeSelectOption, selectOptionsGrouped, selectOptionsHaveIcon, selectOptionsOf } from "@mmda/core"
import { emitDropDownListChange } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

export function primeSelectModel(options: UiSelectOption[]) {
  if (!selectOptionsGrouped(options)) return options;
  return nestSelectOptionsByGroup(options).map((group) => ({
    label: group.label,
    items: group.options,
  }));
}

export function primeOptionSlot(options: UiSelectOption[]) {
  if (!selectOptionsHaveIcon(options)) return undefined;
  return (slot: { option?: UiSelectOption }) => {
    const option = slot.option;
    if (!option) return null;
    return h("span", { class: "mmda-dropdown-list__item" }, [
      option.icon ? h("i", { class: option.icon }) : null,
      option.label,
    ]);
  };
}

export function createDropDownList(props: UiDropDownListProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    placeholder,
    disabled,
    allowFiltering,
    suggest,
    minLength,
    debounceDelay: _debounceDelay,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const local = selectOptionsOf(props);
  const grouped = selectOptionsGrouped(local);
  const state = reactive({
    options: primeSelectModel(local),
  });
  const filterMin = minLength ?? SELECT_MIN_LENGTH;

  return h(
    Select as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      modelValue: dropDownListValueOf(props) ?? null,
      options: state.options,
      optionLabel: "label",
      optionValue: "value",
      optionGroupLabel: grouped ? "label" : undefined,
      optionGroupChildren: grouped ? "items" : undefined,
      placeholder,
      disabled,
      filter: allowFiltering !== false,
      class: [...dropDownListModifierClasses(props)].flat(),
      onFilter: suggest
        ? (event: { value?: string }) => {
            const query = String(event?.value ?? "");
            if (query.length < filterMin) {
              state.options = [];
              return;
            }
            void Promise.resolve(suggest(query)).then((rows) => {
              const next = (rows ?? []).map((item) =>
                normalizeSelectOption(item as string | UiSelectOption),
              );
              state.options = primeSelectModel(next);
            });
          }
        : undefined,
      "onUpdate:modelValue": (next: string | number | null) =>
        emitDropDownListChange(props, next ?? null),
    },
    primeOptionSlot(local) ? { option: primeOptionSlot(local) } : undefined,
  );
}

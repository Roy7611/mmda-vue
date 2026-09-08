import { h } from "vue";
import SelectButton from "primevue/selectbutton";
import type { UiSelectButtonGroupProps } from "@mmda/vui";
import { selectButtonGroupUpdateOf } from "@mmda/vui";

export function createSelectButtonGroup(
  value: unknown,
  props: UiSelectButtonGroupProps = {},
) {
  const {
    options = [],
    optionLabel,
    optionValue,
    selectionMode,
    modelValue,
    onUpdate: _onUpdate,
    htmlAttributes,
    class: className,
    orientation,
    ...rest
  } = props;
  const emit = selectButtonGroupUpdateOf(props);
  return h(SelectButton, {
    ...rest,
    ...htmlAttributes,
    modelValue: modelValue ?? value,
    "onUpdate:modelValue": emit,
    options,
    optionLabel,
    optionValue,
    multiple: selectionMode === "multiple",
    class: [
      "mmda-select-button-group",
      orientation === "vertical" ? "mmda-select-button-group--vertical" : "",
      className,
    ].filter(Boolean),
  });
}

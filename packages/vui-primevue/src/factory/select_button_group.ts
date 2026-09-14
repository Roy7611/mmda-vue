import { h } from "vue";
import SelectButton from "primevue/selectbutton";
import type { UiSelectButtonGroupProps } from "@mmda/core"
import { selectButtonOptionIcon, selectButtonOptionLabel } from "@mmda/core"
import { createIconVNode, selectButtonGroupUpdateOf } from "@mmda/vui"
export function createSelectButtonGroup(
  value: unknown,
  props: UiSelectButtonGroupProps = {},
  resolveIcon: (icon: string) => string = (icon) => icon,
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
  const hasIcon = options.some((option) => selectButtonOptionIcon(option));
  return h(
    SelectButton,
    {
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
        hasIcon ? "mmda-select-button-group--icons" : "",
        className,
      ].filter(Boolean),
    },
    hasIcon
      ? {
          option: (slot: { option: unknown }) => {
            const icon = selectButtonOptionIcon(slot.option);
            const label = selectButtonOptionLabel(slot.option, optionLabel);
            return icon
              ? createIconVNode(resolveIcon(icon), {
                  title: label,
                  "aria-hidden": "true",
                })
              : label;
          },
        }
      : undefined,
  );
}

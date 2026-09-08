import { h } from "vue";
import { RadioButtonComponent } from "@syncfusion/ej2-vue-buttons";
import type { UiRadioButtonGroupProps } from "@mmda/vui";
import {
  emitRadioButtonGroupChange,
  htmlAttributesOf,
  radioButtonGroupItemSelected,
  radioButtonGroupItemsOf,
  radioButtonGroupModifierClasses,
  radioButtonGroupNameOf,
} from "@mmda/vui";

export function createRadioButtonGroup(props: UiRadioButtonGroupProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    optionLabel: _optionLabel,
    optionValue: _optionValue,
    orientation: _orientation,
    disabled,
    name: _name,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const name = radioButtonGroupNameOf(props);
  const items = radioButtonGroupItemsOf(props);

  return h(
    "div",
    {
      ...rest,
      ...htmlAttributesOf(props),
      role: "radiogroup",
      class: radioButtonGroupModifierClasses(props),
    },
    items.map((item) =>
      h(RadioButtonComponent as any, {
        name,
        label: item.label,
        value: item.value,
        checked: radioButtonGroupItemSelected(props, item.value),
        disabled: Boolean(disabled),
        change: () => emitRadioButtonGroupChange(props, item.value),
      }),
    ),
  );
}

import { h } from "vue";
import RadioButton from "primevue/radiobutton";
import type { UiRadioButtonGroupProps } from "@mmda/vui";
import {
  emitRadioButtonGroupChange,
  htmlAttributesOf,
  radioButtonGroupItemsOf,
  radioButtonGroupModifierClasses,
  radioButtonGroupNameOf,
  radioButtonGroupValueOf,
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
  const current = radioButtonGroupValueOf(props);

  return h(
    "div",
    {
      ...rest,
      ...htmlAttributesOf(props),
      role: "radiogroup",
      class: radioButtonGroupModifierClasses(props),
    },
    items.map((item, index) => {
      const inputId = `${name}-${index}`;
      return h("label", { class: "mmda-radiobuttongroup__item", for: inputId }, [
        h(RadioButton, {
          inputId,
          name,
          value: item.value,
          modelValue: current,
          disabled: Boolean(disabled),
          "onUpdate:modelValue": (next: unknown) =>
            emitRadioButtonGroupChange(props, next),
        }),
        item.label,
      ]);
    }),
  );
}

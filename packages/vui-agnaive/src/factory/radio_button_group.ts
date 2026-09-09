import { h } from "vue";
import { NRadio, NRadioGroup } from "naive-ui";
import type { UiRadioButtonGroupProps } from "@mmda/core"
import { emitRadioButtonGroupChange, radioButtonGroupItemsOf, radioButtonGroupModifierClasses, radioButtonGroupNameOf, radioButtonGroupValueOf } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

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

  const items = radioButtonGroupItemsOf(props);

  return h(
    NRadioGroup as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      name: radioButtonGroupNameOf(props),
      value: radioButtonGroupValueOf(props) ?? null,
      disabled: Boolean(disabled),
      class: radioButtonGroupModifierClasses(props),
      "onUpdate:value": (next: unknown) =>
        emitRadioButtonGroupChange(props, next),
    },
    {
      default: () =>
        items.map((item) =>
          h(
            NRadio as any,
            { value: item.value, key: String(item.value) },
            { default: () => item.label },
          ),
        ),
    },
  );
}

import { h } from "vue";
import ToggleSwitch from "primevue/toggleswitch";
import type { UiSwitchProps } from "@mmda/vui";
import {
  emitSwitchChange,
  htmlAttributesOf,
  switchCheckedOf,
  switchModifierClasses,
} from "@mmda/vui";

export function createSwitch(props: UiSwitchProps) {
  const {
    checked: _checked,
    modelValue: _modelValue,
    onLabel: _onLabel,
    offLabel: _offLabel,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  return h(ToggleSwitch, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: switchCheckedOf(props),
    disabled,
    class: switchModifierClasses(props),
    "onUpdate:modelValue": (value: boolean) =>
      emitSwitchChange(props, Boolean(value)),
  });
}

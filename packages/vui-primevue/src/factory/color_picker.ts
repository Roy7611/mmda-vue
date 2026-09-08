import { h } from "vue";
import ColorPicker from "primevue/colorpicker";
import type { UiColorPickerProps } from "@mmda/vui";
import {
  colorPickerHexOf,
  colorPickerModifierClasses,
  colorPickerValueOf,
  emitColorPickerChange,
  htmlAttributesOf,
} from "@mmda/vui";

export function createColorPicker(props: UiColorPickerProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    mode: _mode,
    showModeSwitcher: _showModeSwitcher,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  return h(ColorPicker, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: colorPickerValueOf(props),
    disabled,
    format: "hex",
    class: [...colorPickerModifierClasses(props)].flat(),
    "onUpdate:modelValue": (next: unknown) =>
      emitColorPickerChange(props, colorPickerHexOf(next)),
  });
}

import { h } from "vue";
import { ColorPickerComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiColorPickerProps } from "@mmda/vui"
import { colorPickerHexOf, colorPickerModifierClasses, colorPickerValueOf, emitColorPickerChange, htmlAttributesOf } from "@mmda/vui"

export function createColorPicker(props: UiColorPickerProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    mode,
    showModeSwitcher,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = colorPickerModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(ColorPickerComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: colorPickerValueOf(props),
    disabled,
    mode: mode === "palette" ? "Palette" : "Picker",
    modeSwitcher: showModeSwitcher !== false,
    cssClass,
    change: (args: {
      currentValue?: { hex?: string; rgba?: string };
      value?: string;
    }) => {
      emitColorPickerChange(
        props,
        colorPickerHexOf(
          args?.currentValue?.hex ?? args?.currentValue?.rgba ?? args?.value,
        ),
      );
    },
  });
}

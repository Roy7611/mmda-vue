import { h } from "vue";
import { SliderComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiSliderProps } from "@mmda/vui";
import {
  emitSliderChange,
  htmlAttributesOf,
  sliderMaxOf,
  sliderMinOf,
  sliderModifierClasses,
  sliderStepOf,
  sliderTypeOf,
  sliderValueOf,
} from "@mmda/vui";

export function createSlider(props: UiSliderProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    min: _min,
    max: _max,
    step: _step,
    type: _type,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = sliderModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const isDisabled = disabled === true || disabled === "true";

  return h(SliderComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: sliderValueOf(props),
    min: sliderMinOf(props),
    max: sliderMaxOf(props),
    step: sliderStepOf(props),
    type: sliderTypeOf(props),
    enabled: !isDisabled,
    cssClass,
    change: (args: { value?: unknown }) => emitSliderChange(props, args),
    changed: (args: { value?: unknown }) => emitSliderChange(props, args),
  });
}

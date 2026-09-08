import { h } from "vue";
import Slider from "primevue/slider";
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
    ...rest
  } = props;

  const type = sliderTypeOf(props);

  return h(Slider, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: sliderValueOf(props),
    min: sliderMinOf(props),
    max: sliderMaxOf(props),
    step: sliderStepOf(props),
    range: type === "Range",
    disabled: disabled === true || disabled === "true",
    class: sliderModifierClasses(props).flat(),
    "onUpdate:modelValue": (next: unknown) => emitSliderChange(props, next),
  });
}

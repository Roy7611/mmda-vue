import { h } from 'vue'
import { NSlider } from 'naive-ui'
import type { UiSliderProps } from '@mmda/vui'
import {
  emitSliderChange,
  htmlAttributesOf,
  sliderMaxOf,
  sliderMinOf,
  sliderModifierClasses,
  sliderStepOf,
  sliderTypeOf,
  sliderValueOf,
} from '@mmda/vui'

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
  } = props

  const type = sliderTypeOf(props)

  return h(NSlider, {
    ...rest,
    ...htmlAttributesOf(props),
    value: sliderValueOf(props),
    min: sliderMinOf(props),
    max: sliderMaxOf(props),
    step: sliderStepOf(props),
    range: type === 'Range',
    disabled: disabled === true || disabled === 'true',
    class: sliderModifierClasses(props).flat(),
    'onUpdate:value': (next: unknown) => emitSliderChange(props, next),
  })
}

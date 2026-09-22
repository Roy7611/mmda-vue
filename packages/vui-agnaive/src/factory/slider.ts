import { h } from 'vue'
import { NSlider } from 'naive-ui'
import type { UiSliderProps } from '@mmda/vui'
import { emitSliderChange, sliderMaxOf, sliderMinOf, sliderModifierClasses, sliderStepOf, sliderTypeOf, sliderValueOf } from '@mmda/vui'
import { uiRenderProps } from '@mmda/core'
import type { VuiModelProps } from "@mmda/vui"

export function createSlider(props: VuiModelProps<UiSliderProps>) {
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
    ...uiRenderProps(props).attributes,
    value: sliderValueOf(props),
    min: sliderMinOf(props),
    max: sliderMaxOf(props),
    step: sliderStepOf(props),
    range: type === 'Range',
    disabled: disabled === true,
    class: sliderModifierClasses(props).flat(),
    'onUpdate:value': (next: unknown) => emitSliderChange(props, next),
  })
}

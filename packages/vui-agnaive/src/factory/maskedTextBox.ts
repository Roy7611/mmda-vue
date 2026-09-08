import { h } from 'vue'
import { NInput } from 'naive-ui'
import type { UiMaskedTextBoxProps } from '@mmda/vui'
import {
  emitMaskedTextBoxChange,
  htmlAttributesOf,
  maskedTextBoxModifierClasses,
  maskedTextBoxValueOf,
} from '@mmda/vui'

export function createMaskedTextBox(props: UiMaskedTextBoxProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    mask,
    placeholder,
    disabled,
    promptChar: _promptChar,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props

  return h(NInput, {
    ...rest,
    ...htmlAttributesOf(props),
    value: maskedTextBoxValueOf(props),
    placeholder: placeholder || mask,
    disabled: disabled === true || disabled === 'true',
    class: [...maskedTextBoxModifierClasses(props)].flat(),
    'onUpdate:value': (next: string | null) =>
      emitMaskedTextBoxChange(props, next ?? ''),
  })
}

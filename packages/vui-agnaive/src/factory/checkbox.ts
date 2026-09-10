import { h } from 'vue'
import { NCheckbox } from 'naive-ui'
import type { UiCheckBoxProps } from '@mmda/core'
import { checkBoxCheckedOf, checkBoxModifierClasses } from '@mmda/core'
import { emitCheckBoxChange } from '@mmda/vui'
import { htmlAttributesOf } from '@mmda/vui'

export function createCheckBox(props: UiCheckBoxProps) {
  const {
    checked: _checked,
    modelValue: _modelValue,
    label,
    indeterminate,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props

  return h(
    NCheckbox,
    {
      ...rest,
      ...htmlAttributesOf(props),
      checked: checkBoxCheckedOf(props),
      disabled: disabled,
      ...(indeterminate === true ? { indeterminate: true } : {}),
      'onUpdate:checked': (value: boolean) => emitCheckBoxChange(props, value),
      class: [...checkBoxModifierClasses(props)].flat(),
    },
    label ? { default: () => label } : undefined,
  )
}

import { h } from 'vue'
import { NSwitch } from 'naive-ui'
import type { UiSwitchProps } from '@mmda/core'
import { emitSwitchChange, switchCheckedOf, switchModifierClasses } from '@mmda/core'
import { htmlAttributesOf } from '@mmda/vui'

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
  } = props

  return h(NSwitch, {
    ...rest,
    ...htmlAttributesOf(props),
    value: switchCheckedOf(props),
    disabled,
    class: switchModifierClasses(props),
    'onUpdate:value': (value: boolean) => emitSwitchChange(props, Boolean(value)),
  })
}

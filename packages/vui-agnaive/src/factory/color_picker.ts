import { h } from 'vue'
import { NColorPicker } from 'naive-ui'
import type { UiColorPickerProps } from '@mmda/vui'
import { colorPickerHexOf, colorPickerModifierClasses, colorPickerValueOf, emitColorPickerChange } from '@mmda/vui'
import { uiRenderProps } from '@mmda/core'
import type { VuiModelProps } from "@mmda/vui"

export function createColorPicker(props: VuiModelProps<UiColorPickerProps>) {
  const {
    value: _value,
    modelValue: _modelValue,
    mode,
    showModeSwitcher: _showModeSwitcher,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props

  return h(NColorPicker, {
    ...rest,
    ...uiRenderProps(props).attributes,
    value: colorPickerValueOf(props) || null,
    disabled,
    modes: mode === 'palette' ? undefined : ['hex'],
    class: [...colorPickerModifierClasses(props)].flat(),
    'onUpdate:value': (next: string | null) =>
      emitColorPickerChange(props, colorPickerHexOf(next)),
  })
}

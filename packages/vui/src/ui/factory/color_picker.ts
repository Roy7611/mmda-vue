/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/color-picker/mode-and-value
 *
 * chrome 取色走 factory.colorPicker。值一律 hex。
 * 字段 fieldFactory.colorPicker 译 MetaUiField 后再调本控件。
 */
import type { UiColorPickerMode, UiColorPickerProps } from '@mmda/core'
import type {UiProps} from '@mmda/core'
import { vuiUpdateOf, type VuiEmitProps, type VuiModelProps } from '../vui_props'
import { colorPickerHexOf } from '@mmda/core'
export { colorPickerHexOf, colorPickerPropsFromField } from '@mmda/core'

export type { UiColorPickerMode, UiColorPickerProps } from '@mmda/core'

export type { UiFieldBindContext as ColorPickerFieldContext } from '@mmda/core'

export function colorPickerValueOf(
  props: VuiModelProps<UiColorPickerProps>,
): string | undefined {
  if (props.value !== undefined) {
    const hex = colorPickerHexOf(props.value)
    return hex || undefined
  }
  if (props.modelValue !== undefined) {
    const hex = colorPickerHexOf(props.modelValue)
    return hex || undefined
  }
  return undefined
}

export function emitColorPickerChange(
  props: VuiEmitProps<UiColorPickerProps>,
  value: string,
): void {
  const hex = colorPickerHexOf(value)
  props.onChange?.(hex)
  vuiUpdateOf(props)?.(hex)
}

export { colorPickerModifierClasses } from '@mmda/core'

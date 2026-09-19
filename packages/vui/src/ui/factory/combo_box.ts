import { callUiBagFn, type UiComboBoxProps } from '@mmda/core'
import { vueUpdateOf } from '../vue_ui_props'

export type { UiComboBoxProps } from '@mmda/core'
export {
  comboBoxAllowCustom,
  comboBoxModifierClasses,
  comboBoxPropsFromField,
  comboBoxValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitComboBoxChange(
  props: UiComboBoxProps,
  value: string | number | null,
): void {
  props.onChange?.(value)
  vueUpdateOf(props)?.(value)
}

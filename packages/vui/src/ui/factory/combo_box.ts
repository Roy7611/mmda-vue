import { type UiComboBoxProps } from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'

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
  vuiUpdateOf(props)?.(value)
}

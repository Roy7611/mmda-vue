import { type UiCheckBoxProps } from '@mmda/core'
import { vuiUpdateOf, type VuiEmitProps } from '../vui_props'

export type { UiCheckBoxProps } from '@mmda/core'
export {
  checkBoxCheckedOf,
  checkBoxModifierClasses,
  checkBoxPropsFromField,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitCheckBoxChange(
  props: VuiEmitProps<UiCheckBoxProps>,
  checked: boolean,
): void {
  props.onChange?.(checked)
  vuiUpdateOf(props)?.(checked)
}

import { type UiSwitchProps } from '@mmda/core'
import { vuiUpdateOf, type VuiEmitProps } from '../vui_props'

export type { UiSwitchProps } from '@mmda/core'
export {
  switchCheckedOf,
  switchModifierClasses,
  switchPropsFromField,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitSwitchChange(
  props: VuiEmitProps<UiSwitchProps>,
  checked: boolean,
): void {
  props.onChange?.(checked)
  vuiUpdateOf(props)?.(checked)
}

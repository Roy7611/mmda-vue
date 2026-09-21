import { type UiSwitchProps } from '@mmda/core'
import { vueUpdateOf } from '../vue_ui_props'

export type { UiSwitchProps } from '@mmda/core'
export {
  switchCheckedOf,
  switchModifierClasses,
  switchPropsFromField,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitSwitchChange(
  props: UiSwitchProps,
  checked: boolean,
): void {
  props.onChange?.(checked)
  vueUpdateOf(props)?.(checked)
}

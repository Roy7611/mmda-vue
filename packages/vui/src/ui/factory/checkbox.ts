import { callUiBagFn, type UiCheckBoxProps } from '@mmda/core'
import { vueUpdateOf } from '../vue_ui_props'

export type { UiCheckBoxProps } from '@mmda/core'
export {
  checkBoxCheckedOf,
  checkBoxModifierClasses,
  checkBoxPropsFromField,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitCheckBoxChange(
  props: UiCheckBoxProps,
  checked: boolean,
): void {
  props.onChange?.(checked)
  vueUpdateOf(props)?.(checked)
}

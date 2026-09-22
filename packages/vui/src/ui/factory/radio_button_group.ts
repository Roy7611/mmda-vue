import { type UiRadioButtonGroupProps } from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'

export type { UiRadioButtonGroupProps } from '@mmda/core'
export {
  radioButtonGroupItemSelected,
  radioButtonGroupItemsOf,
  radioButtonGroupModifierClasses,
  radioButtonGroupNameOf,
  radioButtonGroupPropsFromField,
  radioButtonGroupValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitRadioButtonGroupChange(
  props: UiRadioButtonGroupProps,
  value: unknown,
): void {
  props.onChange?.(value)
  vuiUpdateOf(props)?.(value)
}

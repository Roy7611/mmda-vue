import { callUiBagFn, type UiRadioButtonGroupProps } from '@mmda/core'
import { vueUpdateOf } from '../vue_ui_props'

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
  vueUpdateOf(props)?.(value)
}

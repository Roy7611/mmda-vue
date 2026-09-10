import { callUiBagFn, type UiSwitchProps } from '@mmda/core'

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
  callUiBagFn(props, 'onUpdate:modelValue', checked)
  callUiBagFn(props, 'onUpdate', checked)
}

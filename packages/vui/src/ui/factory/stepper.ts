import { callUiBagFn, type UiStepperProps } from '@mmda/core'

export type {
  UiStepperDisplay,
  UiStepperItem,
  UiStepperProps,
} from '@mmda/core'
export {
  noopStepperController,
  stepperDisplayToEj2,
  stepperItemsOf,
  stepperLabelPositionToEj2,
  stepperModifierClasses,
  stepperOrientationOf,
  stepperOrientationToEj2,
  stepperPropsFromField,
  stepperStatusToEj2,
  stepperValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitStepperChange(props: UiStepperProps, value: number): void {
  props.onChange?.(value)
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
}

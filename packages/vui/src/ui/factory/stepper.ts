import { type UiStepperProps } from '@mmda/core'
import { vuiUpdateOf, type VuiEmitProps } from '../vui_props'

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
export function emitStepperChange(
  props: VuiEmitProps<UiStepperProps>,
  value: number,
): void {
  props.onChange?.(value)
  vuiUpdateOf(props)?.(value)
}

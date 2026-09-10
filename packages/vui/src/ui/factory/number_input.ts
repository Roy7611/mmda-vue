import { callUiBagFn, type UiNumberInputProps } from '@mmda/core'

export type {
  UiNumberInputKind,
  UiNumberInputProps,
} from '@mmda/core'
export {
  numberInputDecimalsOf,
  numberInputFormatOf,
  numberInputModifierClasses,
  numberInputPropsFromField,
  numberInputStepOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitNumberInputChange(
  props: UiNumberInputProps,
  value: unknown,
): void {
  let next: number | null = null
  if (value != null && value !== '') {
    if (typeof value === 'object' && 'value' in (value as object)) {
      emitNumberInputChange(props, (value as { value?: unknown }).value)
      return
    }
    const n = Number(value)
    next = Number.isFinite(n) ? n : null
  }
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

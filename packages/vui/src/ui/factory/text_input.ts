import { callUiBagFn, type UiTextInputProps } from '@mmda/core'

export type {
  UiTextInputProps,
  UiTextInputType,
} from '@mmda/core'
export {
  emitTextInputBlur,
  emitTextInputFocus,
  textInputAutocompleteOf,
  textInputDisabledOf,
  textInputHtmlTypeOf,
  textInputMaxLengthOf,
  textInputModifierClasses,
  textInputPlaceholderOf,
  textInputPropsFromField,
  textInputReadonlyOf,
  textInputShowClearButtonOf,
  textInputTypeOf,
  textInputValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitTextInputChange(
  props: UiTextInputProps,
  raw: unknown,
): void {
  let unpacked = raw
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const args = raw as { value?: unknown }
    if (args.value !== undefined) unpacked = args.value
  }
  const next = unpacked == null ? '' : String(unpacked)
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

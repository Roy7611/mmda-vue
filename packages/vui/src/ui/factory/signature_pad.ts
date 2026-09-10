import {
  callUiBagFn,
  type UiSignaturePadAction,
  type UiSignaturePadProps,
} from '@mmda/core'

export type {
  UiSignaturePadAction,
  UiSignaturePadFileType,
  UiSignaturePadProps,
} from '@mmda/core'
export {
  signaturePadActionOf,
  signaturePadBlobOf,
  signaturePadFileTypeFromEj2,
  signaturePadFileTypeOf,
  signaturePadModifierClasses,
  signaturePadPropsFromField,
  signaturePadSizeCss,
  signaturePadStringOf,
  signaturePadValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitSignaturePadChange(
  props: UiSignaturePadProps,
  value: string,
  action?: UiSignaturePadAction,
): void {
  props.onChange?.(value, action)
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
}

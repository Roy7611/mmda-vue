import {
  type UiSignaturePadAction,
  type UiSignaturePadProps,
} from '@mmda/core'
import { vuiUpdateOf, type VuiEmitProps } from '../vui_props'

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
  props: VuiEmitProps<UiSignaturePadProps>,
  value: string,
  action?: UiSignaturePadAction,
): void {
  props.onChange?.(value)
  if (action) props.onAction?.(action)
  vuiUpdateOf(props)?.(value)
}

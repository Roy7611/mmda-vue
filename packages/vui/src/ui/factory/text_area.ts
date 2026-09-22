import { type UiTextAreaProps } from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'

export type {
  UiTextAreaProps,
  UiTextAreaResizeMode,
} from '@mmda/core'
export {
  DEFAULT_TEXT_AREA_ROWS,
  textAreaAutoResizeOf,
  textAreaColsOf,
  textAreaCssResizeOf,
  textAreaDisabledOf,
  textAreaMaxLengthOf,
  textAreaModifierClasses,
  textAreaPropsFromField,
  textAreaReadOnlyOf,
  textAreaResizeModeOf,
  textAreaRowsOf,
  textAreaValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitTextAreaChange(
  props: UiTextAreaProps,
  raw: unknown,
): void {
  let unpacked = raw
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const args = raw as { value?: unknown }
    if (args.value !== undefined) unpacked = args.value
  }
  const next = unpacked == null ? '' : String(unpacked)
  props.onChange?.(next)
  vuiUpdateOf(props)?.(next)
}

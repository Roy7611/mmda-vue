import { type UiDropDownListProps } from '@mmda/core'
import { vuiUpdateOf, type VuiEmitProps } from '../vui_props'

export type { UiDropDownListProps } from '@mmda/core'
export {
  dropDownListModifierClasses,
  dropDownListPropsFromField,
  dropDownListValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitDropDownListChange(
  props: VuiEmitProps<UiDropDownListProps>,
  value: string | number | null,
): void {
  props.onChange?.(value)
  vuiUpdateOf(props)?.(value)
}

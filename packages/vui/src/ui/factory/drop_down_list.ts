import { type UiDropDownListProps } from '@mmda/core'
import { vueUpdateOf } from '../vue_ui_props'

export type { UiDropDownListProps } from '@mmda/core'
export {
  dropDownListModifierClasses,
  dropDownListPropsFromField,
  dropDownListValueOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitDropDownListChange(
  props: UiDropDownListProps,
  value: string | number | null,
): void {
  props.onChange?.(value)
  vueUpdateOf(props)?.(value)
}

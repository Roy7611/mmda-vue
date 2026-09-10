import { callUiBagFn, type UiDropDownListProps } from '@mmda/core'

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
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
}

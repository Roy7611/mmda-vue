import type { UiSelectButtonGroupProps } from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'

export type { UiSelectButtonGroupProps } from '@mmda/core'
export {
  buttonModifierClasses,
  selectButtonGroupSelected,
  selectButtonOptionIcon,
  selectButtonOptionLabel,
  selectButtonOptionValue,
  toggleSelectButtonGroupValue,
  type UiButtonGroupProps,
  type UiButtonProps,
  type UiButtonSize,
  type UiButtonShape,
  type UiButtonSlots,
  type UiButtonType,
  type UiLinkProps,
  type UiLinkSlots,
  type UiLinkType,
} from '@mmda/core'

/** Vue v-model 写入回调：`onUpdate` → `onUpdate:modelValue`（归一在 `vuiUpdateOf`）。 */
export function selectButtonGroupUpdateOf(
  props: UiSelectButtonGroupProps,
): ((value: unknown) => void) | undefined {
  return vuiUpdateOf<unknown>(props)
}

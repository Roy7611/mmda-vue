import type { UiSelectButtonGroupProps } from '@mmda/core'

export type { UiSelectButtonGroupProps } from '@mmda/core'
export {
  buttonModifierClasses,
  selectButtonGroupSelected,
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

/** Vue v-model 袋键：优先 `onUpdate`，否则 `onUpdate:modelValue`。 */
export function selectButtonGroupUpdateOf(
  props: UiSelectButtonGroupProps,
): ((value: unknown) => void) | undefined {
  if (props.onUpdate) return props.onUpdate
  const bag = props['onUpdate:modelValue']
  return typeof bag === 'function' ? (bag as (value: unknown) => void) : undefined
}

import type { UiAutoCompleteProps } from '@mmda/core'

/** Vue v-model 袋键：优先 `onUpdate`，否则 `onUpdate:modelValue`。 */
export function autoCompleteUpdateOf(
  props?: UiAutoCompleteProps,
): ((value: string) => void) | undefined {
  if (props?.onUpdate) return props.onUpdate
  const bag = props?.['onUpdate:modelValue']
  return typeof bag === 'function' ? (bag as (value: string) => void) : undefined
}

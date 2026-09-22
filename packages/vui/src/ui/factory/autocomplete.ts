import type { UiAutoCompleteProps } from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'

/** Vue v-model 写入回调：`onUpdate` → `onUpdate:modelValue`（归一在 `vuiUpdateOf`）。 */
export function autoCompleteUpdateOf(
  props?: UiAutoCompleteProps,
): ((value: string) => void) | undefined {
  return vuiUpdateOf<string>(props)
}

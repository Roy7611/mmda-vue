import type { UiAutoCompleteProps } from '@mmda/core'
import { vueUpdateOf } from '../vue_ui_props'

/** Vue v-model 写入回调：`onUpdate` → `onUpdate:modelValue`（归一在 `vueUpdateOf`）。 */
export function autoCompleteUpdateOf(
  props?: UiAutoCompleteProps,
): ((value: string) => void) | undefined {
  return vueUpdateOf<string>(props)
}

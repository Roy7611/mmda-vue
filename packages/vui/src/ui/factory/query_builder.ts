import {
  AdvancedFilterModel,
  type UiQueryBuilderProps,
} from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'

export type {
  UiQueryBuilderChoice,
  UiQueryBuilderColumn,
  UiQueryBuilderProps,
  UiQueryBuilderValueType,
} from '@mmda/core'
export {
  defaultAdvancedColumn,
  defaultAdvancedJoin,
  defaultQueryBuilderOperators,
  queryBuilderColumnOf,
  queryBuilderColumnsOf,
  queryBuilderModifierClasses,
  queryBuilderValueOf,
  queryBuilderValueTypeOf,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitQueryBuilderChange(
  props: UiQueryBuilderProps,
  model: AdvancedFilterModel | undefined,
): void {
  const next = AdvancedFilterModel.compact(model)
  props.onChange?.(next)
  vuiUpdateOf<AdvancedFilterModel | undefined>(props)?.(next)
}

import {
  AdvancedFilterModel,
  type UiQueryBuilderProps,
} from '@mmda/core'

export type {
  AgAdvancedFilterModel,
  AgColumnAdvancedFilter,
  AgJoinAdvancedFilter,
  QueryBuilderRuleModel,
  UiQueryBuilderChoice,
  UiQueryBuilderColumn,
  UiQueryBuilderProps,
  UiQueryBuilderValueType,
} from '@mmda/core'
export {
  advancedToQueryBuilderRule,
  agAdvancedToEntity,
  defaultAdvancedColumn,
  defaultAdvancedJoin,
  defaultQueryBuilderOperators,
  entityToAgAdvanced,
  queryBuilderColumnOf,
  queryBuilderColumnsOf,
  queryBuilderColumnsToEj2,
  queryBuilderModifierClasses,
  queryBuilderRuleToAdvanced,
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
  const vueUpdate = props['onUpdate:modelValue']
  if (typeof vueUpdate === 'function') {
    vueUpdate(next)
  }
  props.onUpdate?.(next)
}

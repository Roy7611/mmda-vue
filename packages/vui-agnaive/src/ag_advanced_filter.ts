/**
 * AG Grid Advanced Filter（getAdvancedFilterModel）↔ AdvancedFilterModel。
 * 不要接到列头 FilterModel / ag_filter。
 */
import {
  AdvancedFilterModel,
  MetaUiFilterOperatorEnum,
  isDateRangeKind,
  type AdvancedFieldFilter,
  type MetaUiFilterOpCode,
  type MetaUiFilterOpValue,
  type UiQueryBuilderValueType,
} from '@mmda/core'

export type AgAdvancedFilterModel =
  | AgJoinAdvancedFilter
  | AgColumnAdvancedFilter

export interface AgJoinAdvancedFilter {
  filterType: 'join'
  type: 'AND' | 'OR'
  conditions: AgAdvancedFilterModel[]
}

export interface AgColumnAdvancedFilter {
  filterType: string
  colId: string
  type: string
  filter?: unknown
  filterTo?: unknown
  values?: unknown[]
}

function leafFilterTypeOf(
  valueType: UiQueryBuilderValueType,
  operator?: MetaUiFilterOpCode,
): AdvancedFieldFilter['filterType'] {
  if (operator === 'IN' || operator === 'NOT_IN') return 'set'
  if (valueType === 'boolean') return 'boolean'
  if (valueType === 'number') return 'number'
  if (valueType === 'date' || valueType === 'datetime') return 'date'
  return 'text'
}

function agColumnTypeOf(filterType: string): UiQueryBuilderValueType {
  if (filterType === 'number') return 'number'
  if (filterType === 'date' || filterType === 'dateString' || filterType === 'dateTime') {
    return filterType === 'dateTime' ? 'datetime' : 'date'
  }
  if (filterType === 'boolean') return 'boolean'
  return 'text'
}

function agTypeToOperator(
  type: string,
  valueType: UiQueryBuilderValueType,
): MetaUiFilterOpCode {
  if (type === 'blank') return valueType === 'text' ? 'IS_BLANK' : 'IS_NULL'
  if (type === 'notBlank') return valueType === 'text' ? 'IS_NOT_BLANK' : 'IS_NOT_NULL'
  if (type === 'inRange') return 'BETWEEN'
  if (type === 'true') return 'IS_TRUE'
  if (type === 'false') return 'IS_FALSE'
  return MetaUiFilterOperatorEnum.nameOf(type as MetaUiFilterOpValue) ?? 'EQ'
}

function operatorToAg(operator: MetaUiFilterOpCode): string {
  if (operator === 'BETWEEN') return 'inRange'
  if (operator === 'IS_NULL' || operator === 'IS_BLANK') return 'blank'
  if (operator === 'IS_NOT_NULL' || operator === 'IS_NOT_BLANK') return 'notBlank'
  if (operator === 'IS_TRUE') return 'true'
  if (operator === 'IS_FALSE') return 'false'
  return MetaUiFilterOperatorEnum.valueOf(operator) ?? 'equals'
}

function leafFromAg(
  model: AgColumnAdvancedFilter,
): AdvancedFieldFilter | undefined {
  const fieldName = String(model.colId ?? '')
  if (!fieldName) return undefined
  const valueType = agColumnTypeOf(model.filterType)
  if (isDateRangeKind(model.type)) {
    return {
      fieldName,
      filterType: 'date',
      operator: 'WITHIN',
      value: model.type,
    }
  }
  const operator = agTypeToOperator(model.type, valueType)
  if (valueType === 'boolean' || operator === 'IS_TRUE' || operator === 'IS_FALSE') {
    return {
      fieldName,
      filterType: 'boolean',
      value: operator === 'IS_FALSE' || model.type === 'false' ? false : true,
    }
  }
  if (operator === 'BETWEEN') {
    return {
      fieldName,
      filterType: leafFilterTypeOf(valueType, operator),
      operator,
      value: model.filter,
      valueTo: model.filterTo,
    }
  }
  return {
    fieldName,
    filterType: leafFilterTypeOf(valueType, operator),
    operator,
    value: model.filter,
  }
}

export function agAdvancedToEntity(
  model?: AgAdvancedFilterModel | null,
): AdvancedFilterModel | undefined {
  if (!model) return undefined
  if (model.filterType === 'join') {
    const join = model as AgJoinAdvancedFilter
    return AdvancedFilterModel.compact({
      filterType: 'join',
      operator: join.type === 'OR' ? 'OR' : 'AND',
      conditions: (join.conditions ?? [])
        .map((item) => agAdvancedToEntity(item))
        .filter((item): item is AdvancedFilterModel => item != null),
    })
  }
  return AdvancedFilterModel.compact(leafFromAg(model as AgColumnAdvancedFilter))
}

function leafToAg(leaf: AdvancedFieldFilter): AgColumnAdvancedFilter {
  const filterType =
    leaf.filterType === 'set' ? 'text' : leaf.filterType
  if (leaf.filterType === 'boolean') {
    return {
      filterType: 'boolean',
      colId: leaf.fieldName,
      type: leaf.value === false ? 'false' : 'true',
    }
  }
  if (leaf.operator === 'WITHIN' || isDateRangeKind(leaf.value)) {
    return {
      filterType: 'date',
      colId: leaf.fieldName,
      type: isDateRangeKind(leaf.value) ? leaf.value : 'within',
    }
  }
  return {
    filterType,
    colId: leaf.fieldName,
    type: operatorToAg(leaf.operator ?? 'EQ'),
    filter: leaf.filterType === 'set' ? leaf.values : leaf.value,
    filterTo: leaf.valueTo,
  }
}

export function entityToAgAdvanced(
  model?: AdvancedFilterModel | null,
): AgAdvancedFilterModel | undefined {
  const compact = AdvancedFilterModel.compact(model)
  if (!compact) return undefined
  if (AdvancedFilterModel.isJoin(compact)) {
    return {
      filterType: 'join',
      type: compact.operator,
      conditions: compact.conditions
        .map((item) => entityToAgAdvanced(item))
        .filter((item): item is AgAdvancedFilterModel => item != null),
    }
  }
  return leafToAg(compact)
}

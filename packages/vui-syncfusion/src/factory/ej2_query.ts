/**
 * EJ2 QueryBuilder RuleModel ↔ AdvancedFilterModel。
 */
import {
  AdvancedFilterModel,
  defaultQueryBuilderOperators,
  isDateRangeKind,
  type AdvancedFieldFilter,
  type MetaUiFilterOpCode,
  type UiQueryBuilderColumn,
  type UiQueryBuilderValueType,
} from '@mmda/core'

export interface QueryBuilderRuleModel {
  condition?: 'and' | 'or'
  rules?: QueryBuilderRuleModel[]
  field?: string
  label?: string
  operator?: string
  value?: unknown
  type?: string
}

const EJ2_TO_OP: Record<string, MetaUiFilterOpCode> = {
  equal: 'EQ',
  notequal: 'NEQ',
  greaterthan: 'GT',
  greaterthanorequal: 'GE',
  lessthan: 'LT',
  lessthanorequal: 'LE',
  startswith: 'STARTS_WITH',
  endswith: 'ENDS_WITH',
  contains: 'CONTAINS',
  notcontains: 'NOT_CONTAINS',
  isnull: 'IS_NULL',
  isnotnull: 'IS_NOT_NULL',
  isempty: 'IS_BLANK',
  isnotempty: 'IS_NOT_BLANK',
  in: 'IN',
  notin: 'NOT_IN',
  between: 'BETWEEN',
  within: 'WITHIN',
}

const OP_TO_EJ2: Partial<Record<MetaUiFilterOpCode, string>> = {
  EQ: 'equal',
  NEQ: 'notequal',
  GT: 'greaterthan',
  GE: 'greaterthanorequal',
  LT: 'lessthan',
  LE: 'lessthanorequal',
  STARTS_WITH: 'startswith',
  ENDS_WITH: 'endswith',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notcontains',
  IS_NULL: 'isnull',
  IS_NOT_NULL: 'isnotnull',
  IS_BLANK: 'isempty',
  IS_NOT_BLANK: 'isnotempty',
  IN: 'in',
  NOT_IN: 'notin',
  BETWEEN: 'between',
  WITHIN: 'within',
  IS_TRUE: 'equal',
  IS_FALSE: 'equal',
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

function ej2TypeOf(valueType: UiQueryBuilderValueType): string {
  if (valueType === 'number') return 'number'
  if (valueType === 'boolean') return 'boolean'
  if (valueType === 'date') return 'date'
  if (valueType === 'datetime') return 'datetime'
  return 'string'
}

function valueTypeFromEj2(type?: string): UiQueryBuilderValueType {
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  if (type === 'date') return 'date'
  if (type === 'datetime') return 'datetime'
  return 'text'
}

function isEj2Group(rule: QueryBuilderRuleModel): boolean {
  return Array.isArray(rule.rules)
}

function leafFromEj2(
  rule: QueryBuilderRuleModel,
): AdvancedFieldFilter | undefined {
  const fieldName = String(rule.field ?? '')
  if (!fieldName) return undefined
  const operator = EJ2_TO_OP[String(rule.operator ?? '').toLowerCase()]
  const valueType = valueTypeFromEj2(rule.type)
  if (valueType === 'boolean') {
    const truthy = rule.value === true || rule.value === 'true' || operator === 'IS_TRUE'
    return { fieldName, filterType: 'boolean', value: operator === 'IS_FALSE' ? false : truthy }
  }
  if (operator === 'IN' || operator === 'NOT_IN') {
    const values = Array.isArray(rule.value) ? rule.value : rule.value == null ? [] : [rule.value]
    return { fieldName, filterType: 'set', operator, values }
  }
  if (operator === 'BETWEEN') {
    const pair = Array.isArray(rule.value) ? rule.value : [rule.value, undefined]
    return {
      fieldName,
      filterType: leafFilterTypeOf(valueType, operator),
      operator,
      value: pair[0],
      valueTo: pair[1],
    }
  }
  if (operator === 'WITHIN' || isDateRangeKind(rule.value)) {
    return {
      fieldName,
      filterType: 'date',
      operator: 'WITHIN',
      value: isDateRangeKind(rule.value) ? rule.value : undefined,
    }
  }
  return {
    fieldName,
    filterType: leafFilterTypeOf(valueType, operator),
    operator: operator ?? 'EQ',
    value: rule.value,
  }
}

export function queryBuilderRuleToAdvanced(
  rule?: QueryBuilderRuleModel | null,
): AdvancedFilterModel | undefined {
  if (!rule) return undefined
  if (isEj2Group(rule)) {
    const operator = rule.condition === 'or' ? 'OR' : 'AND'
    const conditions = (rule.rules ?? [])
      .map((item) => queryBuilderRuleToAdvanced(item))
      .filter((item): item is AdvancedFilterModel => item != null)
    return AdvancedFilterModel.compact({
      filterType: 'join',
      operator,
      conditions,
    })
  }
  return AdvancedFilterModel.compact(leafFromEj2(rule))
}

function columnOf(
  fieldName: string,
  columns: UiQueryBuilderColumn[],
): UiQueryBuilderColumn | undefined {
  return columns.find((item) => item.fieldName === fieldName)
}

function leafToEj2(
  leaf: AdvancedFieldFilter,
  columns: UiQueryBuilderColumn[],
): QueryBuilderRuleModel {
  const column = columnOf(leaf.fieldName, columns)
  const valueType = column?.valueType ?? (
    leaf.filterType === 'number'
      ? 'number'
      : leaf.filterType === 'date'
        ? 'date'
        : leaf.filterType === 'boolean'
          ? 'boolean'
          : 'text'
  )
  if (leaf.filterType === 'boolean') {
    return {
      field: leaf.fieldName,
      label: column?.label,
      operator: 'equal',
      value: leaf.value === false ? false : true,
      type: 'boolean',
    }
  }
  const operator = OP_TO_EJ2[leaf.operator ?? 'EQ'] ?? 'equal'
  if (leaf.filterType === 'set') {
    return {
      field: leaf.fieldName,
      label: column?.label,
      operator,
      value: leaf.values ?? [],
      type: 'string',
    }
  }
  if (leaf.operator === 'BETWEEN') {
    return {
      field: leaf.fieldName,
      label: column?.label,
      operator: 'between',
      value: [leaf.value, leaf.valueTo],
      type: ej2TypeOf(valueType),
    }
  }
  if (leaf.operator === 'WITHIN' || isDateRangeKind(leaf.value)) {
    return {
      field: leaf.fieldName,
      label: column?.label,
      operator: 'within',
      value: leaf.value,
      type: ej2TypeOf(valueType),
    }
  }
  return {
    field: leaf.fieldName,
    label: column?.label,
    operator,
    value: leaf.value,
    type: ej2TypeOf(valueType),
  }
}

export function advancedToQueryBuilderRule(
  model?: AdvancedFilterModel | null,
  columns: UiQueryBuilderColumn[] = [],
): QueryBuilderRuleModel {
  const compact = AdvancedFilterModel.compact(model)
  if (!compact) {
    return { condition: 'and', rules: [] }
  }
  if (AdvancedFilterModel.isJoin(compact)) {
    return {
      condition: compact.operator === 'OR' ? 'or' : 'and',
      rules: compact.conditions.map((item) =>
        advancedToQueryBuilderRule(item, columns),
      ),
    }
  }
  return leafToEj2(compact, columns)
}

export function queryBuilderColumnsToEj2(
  columns: UiQueryBuilderColumn[],
): Record<string, unknown>[] {
  return columns.map((column) => ({
    field: column.fieldName,
    label: column.label,
    type: ej2TypeOf(column.valueType),
    operators: (column.operators ?? defaultQueryBuilderOperators(column.valueType)).map(
      (op) => ({
        key: OP_TO_EJ2[op] ?? 'equal',
        value: op,
      }),
    ),
    values: column.values?.map((item) => item.value),
  }))
}

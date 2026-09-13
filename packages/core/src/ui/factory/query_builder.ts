/*
 * chrome 查询构建器走 factory.queryBuilder。
 * value 是 AdvancedFilterModel（AG Advanced Filter 树），不是列 FilterModel。
 */
import { SqlDataType } from '../../metaui/datatype'
import { MetaRelationType, type MetaUiField } from '../../metaui/metaui_field'
import {
  compactAdvancedFilter,
  isAdvancedJoinFilter,
  type AdvancedColumnFilter,
  type AdvancedFilterModel,
  type AdvancedJoinFilter,
} from '../../models/entity_search'
import type { MetaUiFilterOperatorCode } from '../../metaui/metaui_filter'
import { isDateRangeKind } from '../../utils/date_range'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiQueryBuilderValueType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'

export interface UiQueryBuilderChoice {
  value: unknown
  label: string
}

export interface UiQueryBuilderColumn {
  fieldName: string
  label: string
  valueType: UiQueryBuilderValueType
  operators?: MetaUiFilterOperatorCode[]
  values?: UiQueryBuilderChoice[]
}

export interface UiQueryBuilderProps extends UiProps {
  fields?: MetaUiField[]
  columns?: UiQueryBuilderColumn[]
  value?: AdvancedFilterModel
  disabled?: boolean
  onChange?: (model: AdvancedFilterModel | undefined) => void
  onUpdate?: (model: AdvancedFilterModel | undefined) => void
}

/** EJ2 RuleModel 形状（vui 不依赖 EJ2 包）。 */
export interface QueryBuilderRuleModel {
  condition?: 'and' | 'or'
  rules?: QueryBuilderRuleModel[]
  field?: string
  label?: string
  operator?: string
  value?: unknown
  type?: string
}

/** AG getAdvancedFilterModel 形状。 */
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

const EJ2_TO_OP: Record<string, MetaUiFilterOperatorCode> = {
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

const OP_TO_EJ2: Partial<Record<MetaUiFilterOperatorCode, string>> = {
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

const AG_TO_OP: Record<string, MetaUiFilterOperatorCode> = {
  equals: 'EQ',
  notEqual: 'NEQ',
  contains: 'CONTAINS',
  notContains: 'NOT_CONTAINS',
  startsWith: 'STARTS_WITH',
  endsWith: 'ENDS_WITH',
  greaterThan: 'GT',
  greaterThanOrEqual: 'GE',
  lessThan: 'LT',
  lessThanOrEqual: 'LE',
  inRange: 'BETWEEN',
  within: 'WITHIN',
  blank: 'IS_BLANK',
  notBlank: 'IS_NOT_BLANK',
  true: 'IS_TRUE',
  false: 'IS_FALSE',
}

const OP_TO_AG: Partial<Record<MetaUiFilterOperatorCode, string>> = {
  EQ: 'equals',
  NEQ: 'notEqual',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notContains',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  GT: 'greaterThan',
  GE: 'greaterThanOrEqual',
  LT: 'lessThan',
  LE: 'lessThanOrEqual',
  BETWEEN: 'inRange',
  WITHIN: 'within',
  IS_NULL: 'blank',
  IS_NOT_NULL: 'notBlank',
  IS_BLANK: 'blank',
  IS_NOT_BLANK: 'notBlank',
  IS_TRUE: 'true',
  IS_FALSE: 'false',
}

const TEXT_OPS: MetaUiFilterOperatorCode[] = [
  'EQ',
  'NEQ',
  'CONTAINS',
  'NOT_CONTAINS',
  'STARTS_WITH',
  'ENDS_WITH',
  'IS_BLANK',
  'IS_NOT_BLANK',
  'IN',
  'NOT_IN',
]

const NUMBER_OPS: MetaUiFilterOperatorCode[] = [
  'EQ',
  'NEQ',
  'GT',
  'GE',
  'LT',
  'LE',
  'BETWEEN',
  'IS_NULL',
  'IS_NOT_NULL',
]

const DATE_OPS: MetaUiFilterOperatorCode[] = [
  'EQ',
  'NEQ',
  'GT',
  'GE',
  'LT',
  'LE',
  'BETWEEN',
  'WITHIN',
  'IS_NULL',
  'IS_NOT_NULL',
]

const BOOLEAN_OPS: MetaUiFilterOperatorCode[] = ['IS_TRUE', 'IS_FALSE', 'IS_NULL']

export function queryBuilderValueOf(
  props: UiQueryBuilderProps,
): AdvancedFilterModel | undefined {
  if (props.value !== undefined) return props.value
  if (props.modelValue !== undefined) {
    return props.modelValue as AdvancedFilterModel
  }
  return undefined
}


export function queryBuilderModifierClasses(
  props: UiQueryBuilderProps,
): unknown[] {
  return [uiCssClass('querybuilder'), props.class]
}

export function queryBuilderValueTypeOf(
  field: MetaUiField,
): UiQueryBuilderValueType {
  if (field.dataType === SqlDataType.BIT) return 'boolean'
  if (SqlDataType.isNum(field.dataType)) return 'number'
  if (SqlDataType.isDateTime(field.dataType)) return 'datetime'
  if (
    SqlDataType.isDate(field.dataType) ||
    field.dataType === SqlDataType.YEAR ||
    field.dataType === SqlDataType.YEAR_MONTH
  ) {
    return 'date'
  }
  return 'text'
}

export function defaultQueryBuilderOperators(
  valueType: UiQueryBuilderValueType,
): MetaUiFilterOperatorCode[] {
  if (valueType === 'number') return NUMBER_OPS
  if (valueType === 'date' || valueType === 'datetime') return DATE_OPS
  if (valueType === 'boolean') return BOOLEAN_OPS
  return TEXT_OPS
}

function columnChoicesOf(field: MetaUiField): UiQueryBuilderChoice[] | undefined {
  const ref = field.reference
  if (!ref || ref.hasOne || !ref.refOptions?.length) return undefined
  if (ref.refType !== MetaRelationType.ENUM && ref.refType !== MetaRelationType.REF) {
    return undefined
  }
  return ref.refOptions.map((item) => ({
    value: ref.valueOf(item),
    label: String(ref.labelOf(item) ?? ref.valueOf(item) ?? ''),
  }))
}

export function queryBuilderColumnOf(field: MetaUiField): UiQueryBuilderColumn {
  const valueType = queryBuilderValueTypeOf(field)
  const values = columnChoicesOf(field)
  return {
    fieldName: field.fieldName,
    label: field.displayLabel || field.fieldName,
    valueType,
    operators: defaultQueryBuilderOperators(valueType),
    values,
  }
}

export function queryBuilderColumnsOf(
  props: UiQueryBuilderProps,
): UiQueryBuilderColumn[] {
  if (props.columns?.length) return props.columns
  return (props.fields ?? []).map((field) => queryBuilderColumnOf(field))
}

export function defaultAdvancedJoin(
  operator: 'AND' | 'OR' = 'AND',
): AdvancedJoinFilter {
  return { filterType: 'join', operator, conditions: [] }
}

export function defaultAdvancedColumn(
  column: UiQueryBuilderColumn,
): AdvancedColumnFilter {
  const operator = column.operators?.[0] ?? defaultQueryBuilderOperators(column.valueType)[0]
  if (column.valueType === 'boolean') {
    return { fieldName: column.fieldName, filterType: 'boolean', value: true }
  }
  if (operator === 'IN' || operator === 'NOT_IN') {
    return {
      fieldName: column.fieldName,
      filterType: 'set',
      operator,
      values: [],
    }
  }
  const filterType =
    column.valueType === 'number'
      ? 'number'
      : column.valueType === 'date' || column.valueType === 'datetime'
        ? 'date'
        : 'text'
  return {
    fieldName: column.fieldName,
    filterType,
    operator,
  }
}

function leafFilterTypeOf(
  valueType: UiQueryBuilderValueType,
  operator?: MetaUiFilterOperatorCode,
): AdvancedColumnFilter['filterType'] {
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
): AdvancedColumnFilter | undefined {
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
      dateKind: isDateRangeKind(rule.value) ? rule.value : undefined,
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
    return compactAdvancedFilter({
      filterType: 'join',
      operator,
      conditions,
    })
  }
  return compactAdvancedFilter(leafFromEj2(rule))
}

function columnOf(
  fieldName: string,
  columns: UiQueryBuilderColumn[],
): UiQueryBuilderColumn | undefined {
  return columns.find((item) => item.fieldName === fieldName)
}

function leafToEj2(
  leaf: AdvancedColumnFilter,
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
  if (leaf.operator === 'WITHIN' || isDateRangeKind(leaf.dateKind)) {
    return {
      field: leaf.fieldName,
      label: column?.label,
      operator: 'within',
      value: leaf.dateKind,
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
  const compact = compactAdvancedFilter(model)
  if (!compact) {
    return { condition: 'and', rules: [] }
  }
  if (isAdvancedJoinFilter(compact)) {
    return {
      condition: compact.operator === 'OR' ? 'or' : 'and',
      rules: compact.conditions.map((item) =>
        advancedToQueryBuilderRule(item, columns),
      ),
    }
  }
  return leafToEj2(compact, columns)
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
): MetaUiFilterOperatorCode {
  if (type === 'blank') return valueType === 'text' ? 'IS_BLANK' : 'IS_NULL'
  if (type === 'notBlank') return valueType === 'text' ? 'IS_NOT_BLANK' : 'IS_NOT_NULL'
  return AG_TO_OP[type] ?? 'EQ'
}

function leafFromAg(
  model: AgColumnAdvancedFilter,
): AdvancedColumnFilter | undefined {
  const fieldName = String(model.colId ?? '')
  if (!fieldName) return undefined
  const valueType = agColumnTypeOf(model.filterType)
  if (isDateRangeKind(model.type)) {
    return {
      fieldName,
      filterType: 'date',
      operator: 'WITHIN',
      dateKind: model.type,
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
    return compactAdvancedFilter({
      filterType: 'join',
      operator: join.type === 'OR' ? 'OR' : 'AND',
      conditions: (join.conditions ?? [])
        .map((item) => agAdvancedToEntity(item))
        .filter((item): item is AdvancedFilterModel => item != null),
    })
  }
  return compactAdvancedFilter(leafFromAg(model as AgColumnAdvancedFilter))
}

function leafToAg(leaf: AdvancedColumnFilter): AgColumnAdvancedFilter {
  const filterType =
    leaf.filterType === 'set' ? 'text' : leaf.filterType
  if (leaf.filterType === 'boolean') {
    return {
      filterType: 'boolean',
      colId: leaf.fieldName,
      type: leaf.value === false ? 'false' : 'true',
    }
  }
  if (leaf.operator === 'WITHIN' || isDateRangeKind(leaf.dateKind)) {
    return {
      filterType: 'date',
      colId: leaf.fieldName,
      type: leaf.dateKind ?? 'within',
    }
  }
  return {
    filterType,
    colId: leaf.fieldName,
    type: OP_TO_AG[leaf.operator ?? 'EQ'] ?? 'equals',
    filter: leaf.filterType === 'set' ? leaf.values : leaf.value,
    filterTo: leaf.valueTo,
  }
}

export function entityToAgAdvanced(
  model?: AdvancedFilterModel | null,
): AgAdvancedFilterModel | undefined {
  const compact = compactAdvancedFilter(model)
  if (!compact) return undefined
  if (isAdvancedJoinFilter(compact)) {
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

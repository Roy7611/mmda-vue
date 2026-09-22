import { SqlDataType, DatePeriodToken, isDateRangeKind, MetaUiFilterType, FieldFilter, type FilterModel, type JoinFieldFilter, type MultiFieldFilter, type MetaUiFilterOpCode, type MetaUi, type MetaUiField } from '@mmda/core'
import { columnFilterKindOf, hasFilterType, resolveColumnFilterTypes, simpleFilterTypeOf } from './filter_kind'

const listedFields = (metaUi: MetaUi) => {
  const fields = metaUi.getListedFields?.() ?? []
  return fields.length
    ? fields
    : metaUi.groups
        .filter(group => !group.many)
        .flatMap(group => group.fields ?? [])
}

const fieldOf = (metaUi: MetaUi, fieldName: string) =>
  listedFields(metaUi).find(field => field.fieldName === fieldName)

const usesStringBlank = (field?: MetaUiField) =>
  !!field &&
  !field.reference &&
  !SqlDataType.isBool(field.dataType) &&
  !SqlDataType.isDate(field.dataType) &&
  !SqlDataType.isNum(field.dataType)

function agTypeToOperator(
  type?: string,
  field?: MetaUiField,
  fallback?: MetaUiFilterOpCode,
  filterType?: string,
): MetaUiFilterOpCode {
  if (type === 'blank' || type === 'notBlank') {
    const stringBlank = field
      ? usesStringBlank(field)
      : filterType !== 'number' && filterType !== 'date'
    return type === 'blank'
      ? stringBlank
        ? 'IS_BLANK'
        : 'IS_NULL'
      : stringBlank
        ? 'IS_NOT_BLANK'
        : 'IS_NOT_NULL'
  }
  return AG_TO_OP[type ?? ''] ?? fallback ?? 'EQ'
}

const AG_TO_OP: Record<string, MetaUiFilterOpCode> = {
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
  blank: 'IS_BLANK',
  notBlank: 'IS_NOT_BLANK',
}

const OP_TO_AG: Partial<Record<MetaUiFilterOpCode, string>> = {
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
  IS_NULL: 'blank',
  IS_NOT_NULL: 'notBlank',
  IS_BLANK: 'blank',
  IS_NOT_BLANK: 'notBlank',
}

const isSetField = (field?: MetaUiField) =>
  Boolean(
    field &&
      hasFilterType(
        resolveColumnFilterTypes(field),
        MetaUiFilterType.SET,
      ) &&
      !isHasOneFilterField(field),
  )

export function isHasOneFilterField(field?: MetaUiField) {
  if (!field) return false
  if (
    !hasFilterType(
      resolveColumnFilterTypes(field),
      MetaUiFilterType.SET,
    )
  ) {
    return false
  }
  return Boolean(
    field.reference?.hasOne &&
      !field.reference.isEnum &&
      !field.reference.isRef,
  )
}

function simpleFilterType(field?: MetaUiField): 'text' | 'number' | 'date' {
  if (!field) return 'text'
  return simpleFilterTypeOf(field)
}

const pivotDaysByField = new WeakMap<MetaUiField, string[]>()

export function rememberPivotDays(field: MetaUiField, days: string[]) {
  pivotDaysByField.set(field, days)
}

export function pivotDaysOf(field?: MetaUiField) {
  return field ? pivotDaysByField.get(field) : undefined
}

export function agCellToFieldFilter(
  cell: any,
  field?: MetaUiField,
): FieldFilter | undefined {
  if (!cell) return undefined
  if (cell.filterType === 'set' || Array.isArray(cell.values)) {
    const values = [...(cell.values ?? [])]
    const dateField = field && SqlDataType.isDate(field.dataType)
    return {
      filterType: 'set',
      values:
        dateField && DatePeriodToken.isSet(values.map(value => DatePeriodToken.parse(value) ?? value))
          ? DatePeriodToken.compact(values, pivotDaysOf(field))
          : values,
      operator: cell.operator === 'NOT_IN' ? 'NOT_IN' : 'IN',
    }
  }
  if (
    (field && SqlDataType.isBool(field.dataType)) ||
    cell.filterType === 'boolean'
  ) {
    const value =
      cell.value == null
        ? cell.filter === 'true'
          ? true
          : cell.filter === 'false'
            ? false
            : null
        : Boolean(cell.value)
    return { filterType: 'boolean', value }
  }
  if (isDateRangeKind(cell.type)) {
    return FieldFilter.dateKind(cell.type)
  }
  const operator = agTypeToOperator(
    cell.type,
    field,
    cell.operator as MetaUiFilterOpCode,
    cell.filterType,
  )
  return {
    filterType: simpleFilterType(field),
    operator,
    value: cell.filter ?? cell.dateFrom ?? cell.value,
    valueTo: cell.filterTo ?? cell.dateTo ?? cell.valueTo,
  }
}

function agFilterToField(
  raw: any,
  field?: MetaUiField,
): FieldFilter | undefined {
  if (!raw) return undefined
  if (raw.filterType === 'multi' || Array.isArray(raw.filterModels)) {
    const models = (raw.filterModels ?? [])
      .filter(Boolean)
      .map((item: any) => agFilterToField(item, field))
      .filter((item: FieldFilter | undefined): item is FieldFilter => item != null)
      .map((item: FieldFilter) => FieldFilter.compact(item))
      .filter((item: FieldFilter | undefined): item is FieldFilter => item != null)
    if (!models.length) return undefined
    if (models.length === 1) return models[0]
    return { filterType: 'multi', filterModels: models }
  }
  if (
    (raw.operator === 'AND' || raw.operator === 'OR') &&
    Array.isArray(raw.conditions) &&
    raw.conditions.length > 1
  ) {
    const conditions = raw.conditions
      .map((item: any) => agCellToFieldFilter(item, field))
      .filter((item: FieldFilter | undefined): item is FieldFilter => item != null)
    if (!conditions.length) return undefined
    if (conditions.length === 1) return conditions[0]
    return {
      filterType: 'join',
      operator: raw.operator,
      conditions,
    }
  }
  const cell =
    raw.operator === 'AND' || raw.operator === 'OR'
      ? raw.conditions?.[0]
      : raw
  return agCellToFieldFilter(cell, field)
}

export function agFilterModelToEntity(
  agModel: Record<string, any> | null | undefined,
  metaUi: MetaUi,
): FilterModel {
  const next: FilterModel = {}
  if (!agModel) return next
  for (const [fieldName, raw] of Object.entries(agModel)) {
    if (!raw) continue
    const mapped = agFilterToField(raw, fieldOf(metaUi, fieldName))
    const compacted = FieldFilter.compact(mapped)
    if (compacted) next[fieldName] = compacted
  }
  return next
}

function fieldFilterToAg(filter: FieldFilter, field?: MetaUiField): any {
  if (filter.filterType === 'multi') {
    return {
      filterType: 'multi',
      filterModels: filter.filterModels?.map(item => fieldFilterToAg(item, field)),
    }
  }
  if (filter.filterType === 'join') {
    const conditions = filter.conditions?.map(item => fieldFilterToAg(item, field))
    const firstType = conditions?.[0]?.filterType ?? simpleFilterType(field)
    return {
      filterType: firstType,
      operator: filter.operator,
      conditions,
    }
  }
  if (filter.filterType === 'set' || isSetField(field) || isHasOneFilterField(field)) {
    if (filter.filterType === 'set' || 'values' in filter) {
      const values = (filter as { values?: unknown[] }).values ?? []
      const dateField = field && SqlDataType.isDate(field.dataType)
      return {
        filterType: 'set',
        values:
          dateField && DatePeriodToken.isSet(values)
            ? DatePeriodToken.expandLeaves(values, pivotDaysOf(field) ?? [])
            : values,
      }
    }
  }
  if (filter.filterType === 'boolean') {
    if (filter.value == null) return undefined
    return {
      filterType: 'text',
      type: 'equals',
      filter: String(filter.value),
    }
  }
  if (filter.filterType !== 'text' && filter.filterType !== 'number' && filter.filterType !== 'date') {
    return undefined
  }
  const kind =
    filter.operator === 'WITHIN' && isDateRangeKind(filter.value)
      ? filter.value
      : undefined
  const type = kind ?? (filter.operator ? OP_TO_AG[filter.operator] : undefined) ?? 'equals'
  if (filter.filterType === 'date') {
    return {
      filterType: 'date',
      type,
      dateFrom: kind ? undefined : filter.value,
      dateTo: kind ? undefined : filter.valueTo,
    }
  }
  if (filter.filterType === 'number') {
    return {
      filterType: 'number',
      type,
      filter: filter.value,
      filterTo: filter.valueTo,
    }
  }
  return {
    filterType: 'text',
    type,
    filter: filter.value,
    filterTo: filter.valueTo,
  }
}

export function entityFilterToAgModel(
  model: FilterModel | null | undefined,
  metaUi: MetaUi,
): Record<string, any> {
  const next: Record<string, any> = {}
  if (!model) return next
  for (const [fieldName, filter] of Object.entries(model)) {
    if (!filter) continue
    const mapped = fieldFilterToAg(filter, fieldOf(metaUi, fieldName))
    if (mapped) next[fieldName] = asDateColumnAgModel(mapped, fieldOf(metaUi, fieldName))
  }
  return next
}

function asDateColumnAgModel(mapped: any, field?: MetaUiField) {
  if (!mapped || !field || !SqlDataType.isDate(field.dataType)) return mapped
  if (columnFilterKindOf(field) !== 'multi') return mapped
  if (mapped.filterType === 'multi') {
    const models = (mapped.filterModels ?? []).filter(Boolean)
    const setModel = models.find((item: any) => item.filterType === 'set')
    const dateModel = models.find((item: any) => item && item.filterType !== 'set')
    return {
      filterType: 'multi',
      filterModels: [dateModel ?? null, setModel ?? null],
    }
  }
  if (mapped.filterType === 'set') {
    return { filterType: 'multi', filterModels: [null, mapped] }
  }
  return { filterType: 'multi', filterModels: [mapped, null] }
}

export function listedMetaFields(metaUi: MetaUi): MetaUiField[] {
  return listedFields(metaUi)
}

export function isReferenceSetField(field: MetaUiField) {
  return isSetField(field)
}

export type { FieldFilter, JoinFieldFilter, MultiFieldFilter }

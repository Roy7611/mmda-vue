import {
  SqlDataType,
  MetaUiFieldFilterType,
  hasFilterType,
  resolveColumnFilterTypes,
  simpleFilterTypeOf,
  compactDateSet,
  compactFieldFilter,
  dateKindFilter,
  expandDateSetLeaves,
  isDatePeriodSet,
  isDateRangeKind,
  toDatePeriodToken,
  type EntityFieldFilter,
  type EntityFilterModel,
  type EntityFilterOperator,
  type EntityJoinFieldFilter,
  type EntityMultiFieldFilter,
  type MetaUi,
  type MetaUiField,
} from '@mmda/core'

const listedFields = (metaUi: MetaUi) => {
  const fields = metaUi.getListedFields?.() ?? []
  return fields.length
    ? fields
    : metaUi.groups
        .filter(group => !group.many)
        .flatMap(group => group.fields)
}

const fieldOf = (metaUi: MetaUi, fieldName: string) =>
  listedFields(metaUi).find(field => field.fieldName === fieldName)

const AG_TO_OP: Record<string, EntityFilterOperator> = {
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
  blank: 'IS_NULL',
  notBlank: 'IS_NOT_NULL',
}

const OP_TO_AG: Partial<Record<EntityFilterOperator, string>> = {
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
}

const isSetField = (field?: MetaUiField) =>
  Boolean(
    field &&
      hasFilterType(
        resolveColumnFilterTypes(field),
        MetaUiFieldFilterType.SET,
      ) &&
      !isHasOneFilterField(field),
  )

export function isHasOneFilterField(field?: MetaUiField) {
  if (!field) return false
  if (
    !hasFilterType(
      resolveColumnFilterTypes(field),
      MetaUiFieldFilterType.SET,
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
): EntityFieldFilter | undefined {
  if (!cell) return undefined
  if (cell.filterType === 'set' || Array.isArray(cell.values)) {
    const values = [...(cell.values ?? [])]
    const dateField = field && SqlDataType.isDate(field.dataType)
    return {
      filterType: 'set',
      values:
        dateField && isDatePeriodSet(values.map(value => toDatePeriodToken(value) ?? value))
          ? compactDateSet(values, pivotDaysOf(field))
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
    return dateKindFilter(cell.type)
  }
  const operator =
    AG_TO_OP[cell.type] ??
    (cell.operator as EntityFilterOperator) ??
    'EQ'
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
): EntityFieldFilter | undefined {
  if (!raw) return undefined
  if (raw.filterType === 'multi' || Array.isArray(raw.filterModels)) {
    const models = (raw.filterModels ?? [])
      .filter(Boolean)
      .map((item: any) => agFilterToField(item, field))
      .filter((item: EntityFieldFilter | undefined): item is EntityFieldFilter => item != null)
      .map((item: EntityFieldFilter) => compactFieldFilter(item))
      .filter((item: EntityFieldFilter | undefined): item is EntityFieldFilter => item != null)
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
      .filter((item: EntityFieldFilter | undefined): item is EntityFieldFilter => item != null)
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
): EntityFilterModel {
  const next: EntityFilterModel = {}
  if (!agModel) return next
  for (const [fieldName, raw] of Object.entries(agModel)) {
    if (!raw) continue
    const mapped = agFilterToField(raw, fieldOf(metaUi, fieldName))
    const compacted = compactFieldFilter(mapped)
    if (compacted) next[fieldName] = compacted
  }
  return next
}

function fieldFilterToAg(filter: EntityFieldFilter, field?: MetaUiField): any {
  if (filter.filterType === 'multi') {
    return {
      filterType: 'multi',
      filterModels: filter.filterModels.map(item => fieldFilterToAg(item, field)),
    }
  }
  if (filter.filterType === 'join') {
    const conditions = filter.conditions.map(item => fieldFilterToAg(item, field))
    const firstType = conditions[0]?.filterType ?? simpleFilterType(field)
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
          dateField && isDatePeriodSet(values)
            ? expandDateSetLeaves(values, pivotDaysOf(field) ?? [])
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
  const type = filter.dateKind ?? OP_TO_AG[filter.operator] ?? 'equals'
  if (filter.filterType === 'date') {
    return {
      filterType: 'date',
      type,
      dateFrom: filter.dateKind ? undefined : filter.value,
      dateTo: filter.dateKind ? undefined : filter.valueTo,
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
  model: EntityFilterModel | null | undefined,
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

export type { EntityFieldFilter, EntityJoinFieldFilter, EntityMultiFieldFilter }

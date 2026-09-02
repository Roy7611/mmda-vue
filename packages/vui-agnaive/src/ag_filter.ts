import {
  SqlDataType,
  type EntityFieldFilter,
  type EntityFilterModel,
  type EntityFilterOperator,
  type MetaUi,
  type MetaUiField,
} from '@mmda/core'

const listedFields = (metaui: MetaUi) => {
  const fields = metaui.getListedFields?.() ?? []
  return fields.length
    ? fields
    : metaui.groups
        .filter(group => !group.many)
        .flatMap(group => group.fields)
}

const fieldOf = (metaui: MetaUi, fieldName: string) =>
  listedFields(metaui).find(field => field.fieldName === fieldName)

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
  Boolean(field?.reference?.isEnum || field?.reference?.isRef || field?.reference?.hasOne)

export function agFilterModelToEntity(
  agModel: Record<string, any> | null | undefined,
  metaui: MetaUi,
): EntityFilterModel {
  const next: EntityFilterModel = {}
  if (!agModel) return next
  for (const [fieldName, raw] of Object.entries(agModel)) {
    if (!raw) continue
    const field = fieldOf(metaui, fieldName)
    if (raw.filterType === 'set' || Array.isArray(raw.values)) {
      next[fieldName] = {
        filterType: 'set',
        values: [...(raw.values ?? [])],
        operator: raw.operator === 'NOT_IN' ? 'NOT_IN' : 'IN',
      }
      continue
    }
    if ((field && SqlDataType.isBool(field.dataType)) || raw.filterType === 'boolean') {
      const value =
        raw.value == null
          ? raw.filter === 'true'
            ? true
            : raw.filter === 'false'
              ? false
              : null
          : Boolean(raw.value)
      next[fieldName] = { filterType: 'boolean', value }
      continue
    }
    const operator =
      AG_TO_OP[raw.type] ??
      (raw.operator as EntityFilterOperator) ??
      'EQ'
    const filterType =
      field && SqlDataType.isDate(field.dataType)
        ? 'date'
        : field && SqlDataType.isNum(field.dataType)
          ? 'number'
          : 'text'
    next[fieldName] = {
      filterType,
      operator,
      value: raw.filter ?? raw.dateFrom ?? raw.value,
      valueTo: raw.filterTo ?? raw.dateTo ?? raw.valueTo,
    }
  }
  return next
}

export function entityFilterToAgModel(
  model: EntityFilterModel | null | undefined,
  metaui: MetaUi,
): Record<string, any> {
  const next: Record<string, any> = {}
  if (!model) return next
  for (const [fieldName, filter] of Object.entries(model)) {
    if (!filter) continue
    const field = fieldOf(metaui, fieldName)
    if (filter.filterType === 'set' || isSetField(field)) {
      next[fieldName] = {
        filterType: 'set',
        values: (filter as any).values ?? [],
      }
      continue
    }
    if (filter.filterType === 'boolean') {
      next[fieldName] = {
        filterType: 'text',
        type: 'equals',
        filter: filter.value == null ? undefined : String(filter.value),
      }
      if (filter.value == null) delete next[fieldName]
      continue
    }
    const type = OP_TO_AG[filter.operator] ?? 'equals'
    if (filter.filterType === 'date') {
      next[fieldName] = {
        filterType: 'date',
        type,
        dateFrom: filter.value,
        dateTo: filter.valueTo,
      }
    } else if (filter.filterType === 'number') {
      next[fieldName] = {
        filterType: 'number',
        type,
        filter: filter.value,
        filterTo: filter.valueTo,
      }
    } else {
      next[fieldName] = {
        filterType: 'text',
        type,
        filter: filter.value,
        filterTo: filter.valueTo,
      }
    }
  }
  return next
}

export function listedMetaFields(metaui: MetaUi): MetaUiField[] {
  return listedFields(metaui)
}

export function isReferenceSetField(field: MetaUiField) {
  return isSetField(field)
}

export type { EntityFieldFilter }

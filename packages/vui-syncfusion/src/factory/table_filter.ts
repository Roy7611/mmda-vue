import { DefaultFieldFilter, type FieldFilter, type FilterModel, type MetaUiField } from '@mmda/core'
import {
  applyCompareColumnFilters,
  type CompareColumnFilterStore,
} from './column_filter'
import { gridFiltersToModel } from './utils'

/** 列定义也有 field，不能当成过滤谓词；必须带 operator。菜单比较条件常包在 predicates 里。 */
export const looksLikeFilterPredicates = (value: unknown): boolean => {
  if (value == null) return false
  const items = Array.isArray(value) ? value : [value]
  return items.some(item => {
    if (!item || typeof item !== 'object') return false
    const field = (item as { field?: unknown }).field
    const operator = (item as { operator?: unknown }).operator
    if (field != null && field !== '' && operator != null && String(operator) !== '') {
      return true
    }
    const nested = (item as { predicates?: unknown }).predicates
    return looksLikeFilterPredicates(nested)
  })
}

const firstFilterPredicates = (...candidates: unknown[]) => {
  for (const item of candidates) {
    if (looksLikeFilterPredicates(item)) return item
  }
  return undefined
}

export const isClearFilterAction = (state: any) =>
  String(state?.action?.action ?? state?.action ?? '').toLowerCase().includes(
    'clear',
  )

export const hasGridFilterPredicates = (value: unknown) =>
  looksLikeFilterPredicates(value)

/**
 * 全量列条件。清除时只用 filterSettings（可能已空），不要单字段 currentFilterObject。
 */
export const gridFilterPredicatesOf = (state: any, grid?: any) => {
  const columns = grid?.filterSettings?.columns
  if (isClearFilterAction(state)) return columns
  return firstFilterPredicates(
    columns,
    state?.where,
    state?.filteredColumns,
    state?.action?.columns,
    state?.columns,
    state?.action?.currentFilterObject,
  )
}

const ej2OperatorOf = (operator?: string) => {
  const key = String(operator ?? '').toUpperCase()
  const operators: Record<string, string> = {
    EQ: 'equal',
    NEQ: 'notequal',
    GT: 'greaterthan',
    GE: 'greaterthanorequal',
    LT: 'lessthan',
    LE: 'lessthanorequal',
    STARTS_WITH: 'startswith',
    ENDS_WITH: 'endswith',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'doesnotcontain',
    IN: 'equal',
    NOT_IN: 'notequal',
    IS_BLANK: 'isempty',
    IS_NOT_BLANK: 'isnotempty',
    IS_NULL: 'isnull',
    IS_NOT_NULL: 'notnull',
  }
  return operators[key] ?? 'equal'
}

export const selectedSetValuesOf = (
  filter: FieldFilter | undefined,
  field: MetaUiField,
): unknown[] => {
  if (!filter) return []
  if (field.reference?.isEnum) {
    return DefaultFieldFilter.includedValues(field, filter)
  }
  if (filter.filterType === 'set') return filter.values ?? []
  if (filter.filterType === 'multi') {
    const set = filter.filterModels?.find(item => item.filterType === 'set')
    return set && 'values' in set ? set.values ?? [] : []
  }
  if ('value' in filter && filter.value != null && filter.value !== '') {
    return [filter.value]
  }
  return []
}

/** 同一份 FilterModel 再写一遍就不要远程查，否则 EJ2 还原 columns 会转圈死循环。 */
export const sameFilterModel = (
  left?: FilterModel,
  right?: FilterModel,
) => {
  const keysOf = (model?: FilterModel) =>
    Object.keys(model ?? {})
      .filter(key => model?.[key] != null)
      .sort()
  const leftKeys = keysOf(left)
  const rightKeys = keysOf(right)
  if (
    leftKeys.length !== rightKeys.length ||
    leftKeys.some((key, index) => key !== rightKeys[index])
  ) {
    return false
  }
  return leftKeys.every(
    key => JSON.stringify(left?.[key]) === JSON.stringify(right?.[key]),
  )
}

/** 漏斗只点 class，不要把 columns 丢给 EJ2 再筛一遍（服务端已经按 FilterModel 查过）。 */
export const paintFilterFunnels = (grid: any, model?: FilterModel) => {
  if (!grid) return
  const names = new Set(Object.keys(model ?? {}))
  const columns = grid.getColumns?.() ?? []
  for (const column of columns) {
    const field = String(column?.field ?? '')
    if (!field) continue
    const header =
      grid.getColumnHeaderByField?.(field) ??
      grid.getColumnHeaderByUid?.(column.uid)
    const icon = header?.querySelector?.('.e-filtermenudiv')
    if (!icon?.classList) continue
    icon.classList.toggle('e-filtered', names.has(field))
  }
}

/** 建表时用 FilterModel 还原 EJ2 columns，漏斗高亮和再打开勾选才跟芯片一致。 */
export const gridFilterColumnsFromModel = (
  model: FilterModel | undefined,
  fields: MetaUiField[],
) => {
  if (!model) return []
  const columns: Array<{
    field: string
    operator: string
    value: unknown
    predicate: string
  }> = []
  for (const field of fields) {
    const filter = model[field.fieldName]
    if (!filter) continue
    const values = selectedSetValuesOf(filter, field)
    if (
      filter.filterType === 'set' ||
      field.reference?.isEnum ||
      field.reference?.isRef ||
      field.reference?.hasOne
    ) {
      for (const value of values) {
        columns.push({
          field: field.fieldName,
          operator: 'equal',
          value,
          predicate: 'or',
        })
      }
      continue
    }
    if (values.length) {
      columns.push({
        field: field.fieldName,
        operator: ej2OperatorOf(
          'operator' in filter ? String(filter.operator) : undefined,
        ),
        value: values[0],
        predicate: 'and',
      })
    }
  }
  return columns
}

/** 跳过这次写回时返回 undefined；清全部是 `{}`。 */
export const filterModelFromGridEvent = (
  state: any,
  grid: any,
  fields: MetaUiField[],
  store: CompareColumnFilterStore,
): FilterModel | undefined => {
  const predicates = gridFilterPredicatesOf(state, grid)
  if (!hasGridFilterPredicates(predicates) && !isClearFilterAction(state)) {
    return undefined
  }
  return applyCompareColumnFilters(
    gridFiltersToModel(predicates, fields),
    store,
  )
}

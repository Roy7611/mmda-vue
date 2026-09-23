import { DEFAULT_PAGE_SIZE, type Sort } from '../../models/pagination'
import {
  DefaultFieldFilter,
  EntityQuery,
  FieldFilter,
  type EntitySearchParam,
  type FilterModel,
} from '../../models/entity_search'
import type { UiContext } from '../context'

/** 列表远程查询：排序 / 过滤只写 `searchParam`，皮肤必须等返回的 Promise 再回写 dataSource。 */
export function ensureListPager(
  searchParam: EntitySearchParam,
  defaultPageSize = DEFAULT_PAGE_SIZE,
) {
  if (!searchParam.pager) {
    searchParam.pager = { pageNo: 1, pageSize: defaultPageSize }
  }
  return searchParam.pager
}

export function writeListSorts(
  searchParam: EntitySearchParam,
  sorts: Sort[],
  defaultPageSize = DEFAULT_PAGE_SIZE,
): EntitySearchParam {
  const pager = ensureListPager(searchParam, defaultPageSize)
  pager.sorts = sorts
  pager.pageNo = 1
  return searchParam
}

export function writeListFilterModel(
  searchParam: EntitySearchParam,
  filterModel: FilterModel,
  defaultPageSize = DEFAULT_PAGE_SIZE,
): EntitySearchParam {
  const pager = ensureListPager(searchParam, defaultPageSize)
  const keys = Object.keys(filterModel ?? {})
  searchParam.filterModel = keys.length > 0 ? filterModel : undefined
  pager.pageNo = 1
  return searchParam
}

/** 皮肤在 dataStateChange / sort / filter 后调用：先等查询，再改表格 dataSource。 */
export function settleRemoteListQuery(work: unknown): Promise<void> {
  return Promise.resolve(work).then(
    (): void => undefined,
    (): void => undefined,
  )
}

/** 列 FilterModel 里取回字段当前选中值（枚举走选项补集，与 vui 同源）。 */
export function filterModelSetValues(
  model: FilterModel | undefined,
  fieldName: string,
  field?: {
    reference?: {
      isEnum?: boolean
      refOptions?: unknown[]
      valueOf?: (option: unknown) => unknown
      labelOf?: (option: unknown) => unknown
    }
  },
): unknown[] {
  const filter = model?.[fieldName]
  if (!filter || FieldFilter.isEmpty(filter)) return []
  if (field?.reference?.isEnum) {
    return DefaultFieldFilter.includedValues(field, filter)
  }
  if (filter.filterType === 'set') return [...(filter.values ?? [])]
  if (filter.value != null && filter.value !== '') return [filter.value]
  return []
}

/** 预置查询不可删。 */
export function canDeleteNamedQuery(row: {
  predifined?: boolean
} | null): boolean {
  return row != null && row.predifined !== true
}

/** 清掉已保存查询引用（queryID / queryName）。 */
export function clearNamedQueryRef(context: UiContext) {
  if (!context.searchParam) return
  delete context.searchParam.queryID
  delete context.searchParam.queryName
  delete context.searchParam.queryPredifined
}

/** 应用已保存查询；解析失败返回 false。 */
export function applyNamedQuery(
  context: UiContext,
  row: {
    queryID?: string
    queryName?: string
    queryExpression?: string
    predifined?: boolean
  },
): boolean {
  if (!context.searchParam) return false
  const parsed = EntityQuery.parse(row.queryExpression)
  if (parsed?.kind !== 'query') return false
  EntityQuery.apply(context.searchParam, parsed.query)
  context.searchParam.queryID = row.queryID
  context.searchParam.queryName = row.queryName
  context.searchParam.queryPredifined = row.predifined === true
  delete context.searchParam.searchWord
  if (context.searchParam.pager) context.searchParam.pager.pageNo = 1
  ;(context as unknown as { rememberLastQuery?: () => void }).rememberLastQuery?.()
  return true
}

import {
  defaultSearchParam,
  type EntitySearchParam,
} from '../models/entity'
import {
  NO_PAGINATION,
  type Pagination,
} from '../models/pagination'

/**
 * 关联字段查询过程中的 UI 缓存。
 *
 * 这不是 `MetaUiField` 的元数据，而是每个界面上下文维护的交互状态。
 */
export interface FieldSearchOptions {
  searching?: boolean
  currentSelectOption?: any
  searchParam: EntitySearchParam
  selectOptions: any[]
  cachedSelectOption?: any
  pagination: Pagination
}

const DEFAULT_SEARCH_WORD = '__'

export const defaultFieldSearchOptions = (
  option?: any,
): FieldSearchOptions => ({
  searchParam: defaultSearchParam(DEFAULT_SEARCH_WORD),
  searching: false,
  selectOptions: option ? [option] : [],
  pagination: NO_PAGINATION,
})

export const isDefaultFieldSearchOptions = (options: FieldSearchOptions) =>
  options.searchParam.searchWord === DEFAULT_SEARCH_WORD

/** @deprecated 使用 `FieldSearchOptions`。 */
export type MetaUiFieldOptions = FieldSearchOptions
/** @deprecated 使用 `defaultFieldSearchOptions`。 */
export const defaultFieldOptions = defaultFieldSearchOptions
/** @deprecated 使用 `isDefaultFieldSearchOptions`。 */
export const isDefaultFieldOptions = isDefaultFieldSearchOptions

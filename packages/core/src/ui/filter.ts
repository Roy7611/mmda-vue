import type { MetaUiFilter, MetaUiFilterCondition } from '../metaui/metaui_filter'
import { isArray } from '../utils/is'
import type { UiContext } from './context'
import type { Ref } from './rx'
import type { EntityCustomSearchField } from '../logic/entity_logic'
import type { EntitySearchParam } from '../models/entity_search'

/** 列表快捷过滤芯片：包一层 `MetaUiFilter`，持有当前选中条件。 */
export class UiFilter {
  selectedConditions: Ref<MetaUiFilterCondition[]>

  constructor(
    readonly metaUiFilter: MetaUiFilter,
    makeRef: (value: MetaUiFilterCondition[]) => Ref<MetaUiFilterCondition[]>,
  ) {
    this.selectedConditions = makeRef([])
  }

  get name() {
    return this.metaUiFilter.filterName
  }

  get label() {
    return this.metaUiFilter.filterTitle
  }

  get selectOptions() {
    return this.metaUiFilter.filterConditions
  }

  get filtered() {
    return this.selectedConditions.value.length > 0
  }

  toQuerySQL() {
    return `(${this.selectedConditions.value
      .map((condition) => condition.condition)
      .join(' OR ')})`
  }

  toggle(condition: MetaUiFilterCondition, single = false) {
    const selected = this.selectedConditions.value
    const active = selected.includes(condition)
    this.selectedConditions.value = active
      ? selected.filter((item) => item !== condition)
      : single
        ? [condition]
        : [...selected, condition]
  }
}

/** 多个快捷过滤芯片取交集：每组先 OR，组间 AND。 */
export function quickFiltersToSQL(filters: UiFilter[]) {
  const groups = filters
    .filter((filter) => filter.filtered)
    .map((filter) => filter.toQuerySQL())
  return groups.length ? groups.map((group) => `(${group})`).join(' AND ') : ''
}

/** 自定义搜索字段渲染器：返回框架节点。 */
export type UiCustomSearchRenderer<TNode = unknown> = (
  context: UiContext,
  field: UiCustomSearchField<TNode>,
  ...args: unknown[]
) => TNode

/** Logic 只声明 plain 自定义搜索字段；会话运行时包装成带搜索状态的 {@link UiCustomSearchField}。 */
export interface UiCustomSearchFieldOptions<TNode = unknown> {
  defaultValue?: unknown
  searchLabel: string
  searchParam: string
  renderer: UiCustomSearchRenderer<TNode>
  valueFn?: (value: unknown) => unknown
}

/** 自定义搜索字段的会话态：渲染与取值契约，响应式由实现侧注入。 */
export class UiCustomSearchField<TNode = unknown> {
  readonly searchLabel: string
  readonly searchParam: string
  readonly renderer: UiCustomSearchRenderer<TNode>
  readonly searchVal: Ref<unknown>
  readonly searchWord: Ref<unknown>
  isComposing?: boolean
  valueFn?: (value: unknown) => unknown

  constructor(
    readonly customField: UiCustomSearchFieldOptions<TNode>,
    makeRef: (value?: unknown) => Ref<unknown>,
  ) {
    this.searchLabel = customField.searchLabel
    this.searchParam = customField.searchParam
    this.renderer = customField.renderer
    this.searchVal = makeRef(customField.defaultValue ?? null)
    this.searchWord = makeRef(undefined)
    this.valueFn = customField.valueFn
  }

  get hasVal() {
    const value = this.searchVal.value
    if (isArray(value)) return value.length > 0
    return !!value
  }

  get searchValue() {
    if (this.valueFn) return this.valueFn(this.searchVal.value)
    return this.searchVal.value
  }
}

/** 搜索表单：搜索参数、URL 查询袋与自定义搜索字段。 */
export interface UiSearchForm {
  searchParam?: EntitySearchParam
  queryParams?: Record<string, unknown>
  customSearchFields?: Array<UiCustomSearchField | EntityCustomSearchField>
}

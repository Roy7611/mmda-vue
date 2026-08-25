import type { Entity, EntitySelectParam } from '../models/entity'
import type { MetaUiField } from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { Translatable } from '../metaui/metaui_field'
import type { Pager } from '../models/pagination'
import type { FieldSearchOptions } from './field_search_options'
import type { MetaUiFieldLogic } from './field_logic'
import type { MetaUiGroupLogic } from './group_logic'
import type {
  SubGroupItemTransformParam,
  UiSubGroupMode,
} from './ui_types'
import type { UiValidation } from './validation'

/**
 * 单个实体表单的交互会话约定。
 *
 * 主表实体、子表集合及每条子表记录分别拥有上下文实例。实现可以使用 Vue、
 * React 或小程序自己的响应式机制，但不能把框架类型暴露在此契约中。
 */
export interface UiContext<E extends object = Record<string, any>> {
  readonly metaui: MetaUi
  readonly model: E
  readonly title: string
  readonly locale: string
  readonly editing: boolean
  readonly initialized: boolean
  readonly $v: UiValidation

  load(): Promise<void>
  getModelTitle(model?: Record<string, any>): string
  translate(message: string, param?: Record<string, any>): string
  t(message: string | Translatable | undefined): string

  setModel(model: E): void
  getFieldValue(field: MetaUiField | string): any
  setFieldValue(field: MetaUiField | string, value: any): void
  displayField(field: MetaUiField | string): any

  getFieldLogic(
    field: MetaUiField | string,
  ): MetaUiFieldLogic<any> | undefined
  getGroupLogic(
    group: MetaUiGroup | string,
  ): MetaUiGroupLogic<any, any> | undefined
  getFieldOptions(field: MetaUiField | string): FieldSearchOptions
  getFieldCurrentOption(field: MetaUiField | string): any
  setFieldQueryParams(
    field: MetaUiField | string,
    queryParams: Record<string, any>,
  ): void
  setFieldPager(field: MetaUiField | string, pager: Pager): void

  isFieldReadonly(field: MetaUiField | string): boolean
  isFieldHidden(field: MetaUiField | string): boolean
  isFieldRequired(field: MetaUiField | string): boolean
  hasFieldError(field: MetaUiField | string): boolean
  isInvalid(field: MetaUiField | string): boolean
  getInvalidMessage(field: MetaUiField | string): string
  isGroupReadonly(group: MetaUiGroup | string): boolean
  isGroupHidden(group: MetaUiGroup | string): boolean
  isGroupEditable(group: MetaUiGroup | string): boolean

  validate(): Promise<boolean>
  resetValidation(): void

  selectedItems: any[]
  readonly prev: UiContext<any>
  readonly root: UiContext<any>
  readonly isRoot: boolean
  subGroupContext(group: MetaUiGroup | string): UiContext<any>
  subGroupItemContext<G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
    groupMode?: UiSubGroupMode,
    cacheKey?: string,
  ): UiContext<G>
  with<G extends object>(model: G, cacheKey?: string): UiContext<G>
  treeWith<G extends object>(model: G, cacheKey?: string): UiContext<G>
  getCache(cacheKey?: string): UiContext<any> | undefined

  select<T>(param: EntitySelectParam<T>): Promise<boolean | T[]>
  subGroupItem<G>(
    group: string | MetaUiGroup,
    item: G,
    props?: Record<string, any>,
  ): Promise<false | G>
  newSubGroupItem<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<false | G>
  createSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<G | G[]>
  addSubGroupItem<G extends Entity>(group: string | MetaUiGroup, item: G): void
  addSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): void
  removeSubGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void
  removeSubGroupItems<G extends Entity>(group: string | MetaUiGroup): void
  addQueryParam?(name: string, value: any): void
  refresh?(reloadMetadata?: boolean, setLoading?: boolean): Promise<void>
  routeToRelative?(field: MetaUiField | string): string

  /** Vue 会话附加字段；移植业务 Logic 可继续读这些入口 */
  readonly name?: string
  readonly app?: any
  readonly uiBuilder?: any
  readonly globalProps?: any
  readonly apiClient?: any
  reload?(): Promise<unknown> | unknown
  toSelectManyIndex?(
    selectableKey: string,
    handleFn: (...args: any[]) => unknown,
  ): void
}

import type {
  Entity,
  EntitySearchParam,
  EntitySelectParam,
} from '../models/entity'
import type { MetaUiField, Translatable } from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { Pager } from '../models/pagination'
import type { FieldSearchOptions } from '../logic/field_search_options'
import type { MetaUiFieldLogic } from '../logic/field_logic'
import type { MetaUiGroupLogic } from '../logic/group_logic'
import type { SubGroupItemTransformParam } from '../models/metamodel'
import type { UiValidation } from '../logic/validation'
import type { ApiClient } from '../net/api_client'
import type { UiBuilder } from './builder'
import type { MmdaApplication } from '../mmda_app'

export type UiSelectionMode = 'single' | 'multiple' | 'none' | undefined | ''

/** 子表行对话框的 view。 */
export type UiSubGroupView = 'create' | 'edit' | 'details'

/**
 * 一屏（或会话节点）交互上下文。Logic 钩子用这个类型。
 * Vue globalProps 不在此接口上。
 */
export interface UiContext<M extends object = any> {
  readonly metaui: MetaUi
  readonly locale: string
  readonly initialized: boolean
  readonly model: M
  readonly editing: boolean
  readonly title?: string
  readonly name?: string
  readonly $v?: UiValidation
  isEditDialog?: boolean
  searchParam?: EntitySearchParam
  selectedItems?: any[]
  selectionMode?: 'single' | 'multiple' | null

  translate(message: string, param?: Record<string, any>): string
  t(
    message: string | Translatable | undefined,
    param?: Record<string, any>,
  ): string

  readonly app?: MmdaApplication
  readonly apiClient?: ApiClient
  readonly uiBuilder?: UiBuilder

  getFieldValue(field: MetaUiField | string, model?: any): any
  displayField(field: MetaUiField | string, model?: any): any
  getFieldLogic(field: MetaUiField | string): MetaUiFieldLogic<any> | undefined
  getGroupLogic(
    group: MetaUiGroup | string,
  ): MetaUiGroupLogic<any, any> | undefined
  isFieldReadonly(field: MetaUiField | string): boolean
  isFieldHidden(field: MetaUiField | string): boolean
  isGroupHidden(group: MetaUiGroup | string): boolean
  setFieldValue?(field: MetaUiField | string, value: any): void
  getFieldOptions?(field: MetaUiField | string): FieldSearchOptions
  getFieldCurrentOption?(field: MetaUiField | string): any
  setFieldQueryParams?(
    field: MetaUiField | string,
    queryParams: Record<string, any>,
  ): void
  setFieldPager?(field: MetaUiField | string, pager: Pager): void

  /** 联想 / 列筛，不弹层。 */
  searchRelative?(
    field: MetaUiField,
    searchWord?: string,
    model?: M,
  ): Promise<FieldSearchOptions>

  /** 打开选择器。字段走 pick；对象走任意仓库。 */
  select?(field: MetaUiField | string): Promise<any>
  select?<T>(param: EntitySelectParam<T>): Promise<boolean | T[]>

  load?(): Promise<void>
  getModelTitle?(model?: Record<string, any>): string
  setModel?(model: M): void
  refresh?(reloadMetadata?: boolean, setLoading?: boolean): Promise<void>
  search?(): Promise<unknown>
  reload?(): Promise<unknown> | unknown
  validate?(): Promise<boolean>
  resetValidation?(): void
  isFieldRequired?(field: MetaUiField | string): boolean
  hasFieldError?(field: MetaUiField | string): boolean
  isInvalid?(field: MetaUiField | string): boolean
  getInvalidMessage?(field: MetaUiField | string): string
  isGroupReadonly?(group: MetaUiGroup | string): boolean
  isSubGroupItemDeletable?(group: MetaUiGroup | string, item: Entity): boolean

  readonly prev?: UiContext<any>
  readonly root?: UiContext<any>
  readonly isRoot?: boolean
  with?<G extends object>(model: G, cacheKey?: string): UiContext<G>
  treeWith?<G extends object>(model: G, cacheKey?: string): UiContext<G>
  getCache?(cacheKey?: string): UiContext<any> | undefined
  subGroupContext?<G extends Entity = Entity>(
    group: MetaUiGroup | string,
  ): UiContext<G[]>
  subGroupItemContext?<G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
    groupMode?: UiSubGroupView,
    cacheKey?: string,
  ): UiContext<G>
  beginEdit?(item: object, cacheKey?: string): UiContext<any>
  endEdit?(item: object, cacheKey?: string): void

  subGroupItem?<G>(
    group: string | MetaUiGroup,
    item: G,
    props?: Record<string, any>,
  ): Promise<false | G>
  newSubGroupItem?<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<false | G>
  createSubGroupItems?<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<G | G[]>
  addSubGroupItem?<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void
  addSubGroupItems?<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): void
  removeSubGroupItem?<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void
  removeSubGroupItems?<G extends Entity>(group: string | MetaUiGroup): void

  routeToRelative?(
    field: MetaUiField | string,
    item?: Record<string, any>,
  ): string | null
  index?(): void
  details?(idOrItem?: string | M): void
  edit?(id?: string): void
  create?(): void
  toSelectManyIndex?(
    selectableKey: string,
    handleFn: (...args: any[]) => unknown,
  ): void
  addQueryParam?(name: string, value: any): void
}

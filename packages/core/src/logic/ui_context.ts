import type {
  Entity,
  EntitySearchParam,
  EntitySelectParam,
} from '../models/entity'
import type { MetaUiField } from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { Translatable } from '../metaui/metaui_field'
import type { Pager } from '../models/pagination'
import type { FieldSearchOptions } from './field_search_options'
import type { MetaUiFieldLogic } from './field_logic'
import type { MetaUiGroupLogic } from './group_logic'
import type { SubGroupItemTransformParam } from '../models/metamodel'
import type { UiSubGroupView } from './ui_types'
import type { UiValidation } from './validation'

/**
 * 一屏（或一棵会话节点）的交互上下文。
 *
 * 行为由运行时的 `view` 决定：索引浅列表、详情浅响应（in-place 仍走 onChange）、编辑深层绑定与校验。
 * Logic 回调统一使用本类型，不再按场景拆接口。
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
  t(message: string | Translatable | undefined, param?: Record<string, any>): string

  readonly app?: any
  readonly uiBuilder?: any
  readonly globalProps?: any
  readonly apiClient?: any

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

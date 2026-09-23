import type {
  Entity,
  EntitySearchParam,
  EntitySelectParam,
} from '../models/entity'
import type { MetaUiField, Translatable } from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { FieldSearchOptions } from '../logic/field_search_options'
import type { MetaUiFieldLogic } from '../logic/field_logic'
import type { MetaUiGroupLogic } from '../logic/group_logic'
import type { SubGroupItemTransformParam } from '../models/metamodel'
import type { Validation } from '../logic/validation'
import type { ApiClient } from '../net/api_client'
import type { UiBuilder } from './builder'
import type { UiSearchRow } from './builder/search_view'
import type { UiIndexTableHost } from './builder/list_view'
import type { ModuleContext } from './module_context'
import type { UiViewType } from './view'
import type { Ref } from './rx'
import type { MmdaApplication } from '../mmda_app'
import type { EntityAction } from '../models/entity_action'
import type { EntityLogic } from '../logic/entity_logic'
import type { Module, ModuleAuth } from '../metaui/module'

/** 列表选择模式：单选、多选、不可选或未指定。 */
export type UiSelectionMode = 'single' | 'multiple' | 'none' | undefined | ''

/** 子表行对话框的 view。 */
export type UiSubGroupView = 'create' | 'edit' | 'details'

/**
 * 一屏（或会话节点）的交互上下文。Logic 钩子、字段控件、子表操作都用这个类型。
 *
 * 职责分组：
 * - 字段读写与校验：`getFieldValue` / `setFieldValue` / `displayField` / `validate`
 * - 字段搜索状态：`getFieldSearchOptions` / `getFieldSelectedOption` / `setFieldSearchParam`
 * - 生命周期：`load` / `search` / `reload` / `save` / `delete`
 * - 子上下文：`with` / `treeWith` / `subGroupContext` / `beginEditRow`
 * - 页面跳转与选择：`routeToIndex` / `routeToDetails` / `routeToSearch` / `select` / `selectMany`
 *
 * Vue globalProps 不在此接口上。
 *
 * @typeParam M 当前模型类型；列表页实际为 `M[]`，详情/编辑页为 `M`。
 *
 * @example 读取和写回字段
 * ```ts
 * const name = context.getFieldValue('name')
 * context.setFieldValue('status', 'active')
 * ```
 *
 * @example 修改字段搜索条件并刷新列表
 * ```ts
 * context.setFieldSearchParam('customer', { searchWord: 'A' })
 * await context.search()
 * ```
 *
 * @example 打开仓库选择器并回填字段
 * ```ts
 * const picked = await context.select({ repository: 'customer' })
 * if (picked) context.setFieldValue('customer', picked)
 * ```
 *
 * @example 派生当前行的编辑上下文
 * ```ts
 * const rowCtx = context.beginEditRow(row)
 * rowCtx.setFieldValue('qty', 10)
 * context.endEditRow(row)
 * ```
 *
 * @example 获取子表上下文并操作子表
 * ```ts
 * const itemsCtx = context.subGroupContext('items')
 * itemsCtx.addSubGroupItem('items', item)
 * ```
 */
export interface UiContext<M extends Entity = Entity> {
  /** 当前实体的元数据（字段、分组、权限等）。 */
  readonly metaUi: MetaUi
  /** 当前语言环境，例如 `zh-CN`。 */
  readonly locale: string
  /** 数据是否已经完成初始化。 */
  readonly initialized: boolean
  /** One 是 M，Many 是 M[]。分页在 searchParam.pager。 */
  readonly model: M | M[]
  /** 当前是否处于编辑态。 */
  readonly editing: boolean
  /** 加载中标记（`loading.value`）。 */
  readonly loading: Ref<boolean>
  /** 当前屏标题（列表/详情/编辑屏）。 */
  readonly title?: string
  /** 当前屏或模块名。 */
  readonly name?: string
  /** 校验状态入口，用于读取/重置字段校验。 */
  readonly $v?: Validation
  /**
   * 当前会话是否嵌在对话框里（详情/编辑/选择列表都可能）。
   * 是否可编看 {@link editing}，不要再用 isEditDialog。
   */
  isInDialog: boolean | undefined
  /** 当前列表的查询参数（过滤、排序、分页等）。 */
  searchParam: EntitySearchParam | undefined
  /**
   * 搜索页条件行（草稿）：一行 = 字段 + 叶子。
   * `UiViewOne.Search` 的搜索页与列表页的搜索抽屉共用；未确认前不动 `searchParam.filterModel`。
   */
  searchRows: UiSearchRow[]
  /** 当前实体的业务逻辑。 */
  logic: EntityLogic<M> | undefined
  /** 当前实体所属功能模块，等价于 `logic?.module`。 */
  readonly module?: Module
  /** 当前模块权限，并结合当前行的 `editable` / `deletable` 折叠编辑/删除权限。 */
  getModuleAuth(entity?: Record<string, any>): ModuleAuth | undefined
  /** 多选/勾选的行。 */
  selectedItems: M[] | undefined
  /** 列表进详情/编辑记住的当前行（与勾选 selectedItems 分开）。 */
  currentItem: M | null | undefined
  /** 当前行索引。 */
  currentIndex: number | undefined
  /** 列表选择模式：单选、多选或未指定。 */
  selectionMode: 'single' | 'multiple' | null | undefined
  /** 当前屏是否为列表（many）视图。 */
  readonly many: boolean
  /** 列表页保活表格宿主；皮肤在表格挂载后注入，销毁时置空。 */
  indexTableHost?: UiIndexTableHost
  /** 模块工作区：Index ↔ One 之间的列表保活同步。 */
  moduleContext?: ModuleContext

  /** 基础翻译函数。 */
  translate(message: string, param?: Record<string, unknown>): string
  /** 带参数翻译，兼容 `Translatable` 文案。 */
  t(
    message: string | Translatable | undefined,
    param?: Record<string, unknown>,
  ): string

  /** 应用壳，读应用状态、找模块等。 */
  readonly app: MmdaApplication
  /** 通用读写客户端，业务逻辑不要自行拼 HTTP。 */
  readonly apiClient: ApiClient
  /** UI 构建器，弹层、表格、拼屏都从这里走。 */
  readonly uiBuilder: UiBuilder
  /** 当前视图（index / details / edit / create / search / select…）。 */
  readonly view: UiViewType

  /** 读取字段值。 */
  getFieldValue(field: MetaUiField | string, model?: M): any
  /** 读取字段的展示值，例如 `context.displayField('customer')`。 */
  displayField(field: MetaUiField | string, model?: M): any
  /** 获取字段逻辑。 */
  getFieldLogic(field: MetaUiField | string): MetaUiFieldLogic<M> | undefined
  /** 获取分组逻辑。 */
  getGroupLogic(
    group: MetaUiGroup | string,
  ): MetaUiGroupLogic<M, Entity> | undefined
  /** 字段是否只读。 */
  isFieldReadonly(field: MetaUiField | string): boolean
  /** 字段是否隐藏。 */
  isFieldHidden(field: MetaUiField | string): boolean
  /** 分组是否隐藏。 */
  isGroupHidden(group: MetaUiGroup | string): boolean
  /** 写回字段值。 */
  setFieldValue(field: MetaUiField | string, value: unknown): void
  /** 批量写回字段值，例如 `context.batchSetFieldValue({ productCode: null, productName: null })`。 */
  batchSetFieldValue(values: Record<string, any>): void
  /** 清空字段值并复位其搜索选项。 */
  clearFieldValue(field: MetaUiField | string): void
  /** 获取字段级交互缓存，例如 `context.getFieldSearchOptions('customerID')`。 */
  getFieldSearchOptions(field: MetaUiField | string): FieldSearchOptions
  /** 获取字段当前选中的选项。 */
  getFieldSelectedOption(field: MetaUiField | string): any
  /** 合并字段查询参数，例如 `context.setFieldSearchParam('customerID', { searchWord: 'A' })`。 */
  setFieldSearchParam(
    field: MetaUiField | string,
    patch: Partial<EntitySearchParam>,
  ): void

  /** 联想 / 列筛，不弹层。 */
  searchRelative(
    field: MetaUiField,
    searchWord?: string,
    model?: M,
  ): Promise<FieldSearchOptions>

  /** 打开选择器。字段走 pick；对象走任意仓库。 */
  select(field: MetaUiField | string): Promise<Entity | false>
  /** 选择仓库实体，例如 `await context.select({ repository: 'customer' })`。 */
  select<T extends Entity>(param: EntitySelectParam<T>): Promise<boolean | T[]>

  /** 首次加载当前上下文数据。 */
  load(): Promise<void>
  /** 获取当前模型的展示标题。 */
  getModelTitle(model?: Record<string, any>): string
  /** 替换当前模型。 */
  setModel(model: M | M[]): void
  /** 刷新数据，可重新加载元数据。 */
  refresh(reloadMetadata?: boolean, setLoading?: boolean): Promise<void>
  /** 按当前查询条件执行列表搜索。 */
  search(): Promise<unknown>
  /** 重新加载当前数据。 */
  reload(): Promise<unknown> | unknown
  /** 保存当前编辑数据。 */
  save(): Promise<unknown>
  /** 删除当前数据。 */
  delete(): Promise<unknown>
  /** 校验当前数据，失败时返回 `false`。 */
  validate(): Promise<boolean>
  /** 清空当前校验错误。 */
  resetValidation(): void
  /** 字段是否必填。 */
  isFieldRequired(field: MetaUiField | string): boolean
  /** 字段是否有校验错误。 */
  hasFieldError(field: MetaUiField | string): boolean
  /** 字段是否校验失败。 */
  isInvalid(field: MetaUiField | string): boolean
  /** 获取字段的校验错误文案。 */
  getInvalidMessage(field: MetaUiField | string): string
  /** 分组是否只读。 */
  isGroupReadonly(group: MetaUiGroup | string): boolean
  /** 子表行是否可删除。 */
  isSubGroupItemDeletable(group: MetaUiGroup | string, item: Entity): boolean

  /** 父级上下文。 */
  readonly parent?: UiContext<M>
  /** 根上下文。 */
  readonly root: UiContext<Entity>
  /** 是否为根上下文。 */
  readonly isRoot: boolean
  /** 派生当前行的子上下文，例如 `context.with(row)`。 */
  with<G extends Entity>(model: G, cacheKey?: string): UiContext<G>
  /** 派生树形行上下文。 */
  treeWith<G extends Entity>(model: G, cacheKey?: string): UiContext<G>
  /** 读取缓存中的派生上下文。 */
  cachedContext(cacheKey?: string): UiContext<M> | undefined
  /** 获取子表上下文。 */
  subGroupContext<G extends Entity = Entity>(
    group: MetaUiGroup | string,
  ): UiContext<G>
  /** 获取子表行上下文。 */
  subGroupItemContext<G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
    groupMode?: UiSubGroupView,
    cacheKey?: string,
  ): UiContext<G>
  /** 进入行编辑态并派生该行的编辑上下文。 */
  beginEditRow(item: M, cacheKey?: string): UiContext<M>
  /** 结束行编辑态并释放该行上下文。 */
  endEditRow(item: M, cacheKey?: string): void

  /** 打开子表行对话框并返回处理结果。 */
  subGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
    props?: Record<string, any>,
  ): Promise<false | G>
  /** 新建子表行。 */
  newSubGroupItem<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<false | G>
  /** 批量创建子表行。 */
  createSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<G | G[]>
  /** 本地添加一行到子表。 */
  addSubGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void
  /** 本地批量添加子表行。 */
  addSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): void
  /** 删除一行子表数据。 */
  removeSubGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void
  /** 删除整个子表数据。 */
  removeSubGroupItems<G extends Entity>(group: string | MetaUiGroup): void

  /** 生成关联字段的跳转地址。 */
  routeToRelative(
    field: MetaUiField | string,
    item?: Record<string, any>,
  ): string | null
  /** 跳转到任意应用内路径（跨实体跳转用；当前实体优先走 `routeTo*` 语义化方法）。 */
  navigate(path: string): void
  /** 跳转到列表页。 */
  routeToIndex(): void
  /** 跳转到详情页。 */
  routeToDetails(idOrItem?: string | M): void
  /** 跳转到编辑页。 */
  routeToEdit(idOrItem?: string | M): void
  /** 跳转到新建页。 */
  routeToCreate(): void
  /** 跳转到查询表单页（`UiViewOne.Search`）。 */
  routeToSearch(): void
  /** 打开多选列表页，并把选中结果交给 `handleFn`。 */
  selectMany(
    selectableKey: string,
    handleFn: (...args: unknown[]) => unknown,
  ): void

  /** 把视图 Field/Group Logic 与自定义动作绑到当前会话。 */
  bindLogics(
    fields?: MetaUiFieldLogic<M>[],
    groups?: MetaUiGroupLogic<M, Entity>[],
    customActions?: EntityAction[],
  ): void
}

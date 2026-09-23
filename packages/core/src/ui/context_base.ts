/**
 * 会话基类：框架无关的字段读写、校验帮助、会话树。
 *
 * Vue（VuiContext）和 React（RuiContext）各自继承本类，
 * 只覆写构造器里的响应式包裹与几个桥接方法，不重复业务逻辑。
 *
 * 桥接方法（protected abstract）：子类告诉基类怎么"通知 UI 重绘"和"取原始对象"。
 */
// core 内部用相对路径；自引用 @mmda/core 会让库构建无法解析。
import {
  defineGroupValidation,
  defineValidation,
  validateFieldResult,
  type FieldValidation,
  type Validation,
} from '../logic/validation'
import { isPromise } from '../utils/is'
import { MetaModel, defineEntity, type SubGroupItemTransformParam } from '../models/metamodel'
import {
  defaultFieldSearchOptions,
  type FieldSearchOptions,
} from '../logic/field_search_options'
import { MetaUiFieldLogic } from '../logic/field_logic'
import { MetaUiGroupLogic } from '../logic/group_logic'
import { GenericEntityLogic } from '../logic/entity_logic'
import type { EntityLogic } from '../logic/entity_logic'
import type { EntityCustomSearchField } from '../logic/entity_logic'
import {
  defaultChoicePager,
  isPagedList,
  pagedListIsComplete,
  type PagedList,
  type Pager,
  type Pagination,
} from '../models/pagination'
import type { Entity } from '../models/entity'
import type { EntityAction } from '../models/entity_action'
import type { Attachment, ReportTemplate } from '../models/file'
import type { ApiClient, EntityUrlParam } from '../net/api_client'
import {
  DefaultFieldFilter,
  EntityQuery,
  EntitySearchParam,
} from '../models/entity_search'
import type { EntitySelectParam, FieldFilter } from '../models/entity_search'
import type { SelectableFn } from '../models/entity_search'
import type {
  MetaUiField,
  Translatable,
  TranslateFn,
} from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { MetaUiFilter, MetaUiFilterCondition } from '../metaui/metaui_filter'
import type { Module, ModuleAuth } from '../metaui/module'
import { canDoFromExecutableExpression, type UiAction } from './action'
import type { UiColorRole } from './props'
import { UiCustomSearchField, UiFilter, quickFiltersToSQL, type UiSearchForm } from './filter'
import type { UiContext, UiSubGroupView } from './context'
import type { UiMessageProps } from './factory/message'
import { UiViewMany, UiViewOne, type UiViewType } from './view'
import type { Ref, RxFactory, RxWatchSource } from './rx'
import type { UiRouter } from './router'
import type { UiBuilder } from './builder'
import type { UiIndexTableHost } from './builder/list_view'
import type { ModuleContext } from './module_context'
import { defaultSearchFields, type UiSearchRow } from './builder/search_view'
import type { MmdaApplication } from '../mmda_app'

// ——— helpers ——————————————————————————————————>

function applyPaginationToSearchParam(
  searchParam: { pager?: Pager } | undefined,
  pagination: Pagination,
) {
  if (!searchParam?.pager) return
  const pager = searchParam.pager as Pager & Pagination
  pager.pageSize = pagination.pageSize
  pager.pageNo = pagination.pageNo
  if (pagination.sorts) pager.sorts = pagination.sorts
  pager.recordCount = pagination.recordCount
  pager.pageCount = pagination.pageCount
  pager.from = pagination.from
  pager.to = pagination.to
}

function sessionRow<M>(model: M | M[] | undefined, explicit?: M): M | undefined {
  if (explicit) return explicit
  if (model == null || Array.isArray(model)) return undefined
  return model
}

const identityTranslate: TranslateFn = (message) =>
  typeof message === 'string' ? message : message.message

/** 导入/导出/上传等文件传输参数（框架无关；vui / rui 的皮肤动作共用）。 */
export interface FileTransferOptions extends EntityUrlParam {
  file?: File
  files?: File[]
  body?: unknown
  handlerFn?: (context: UiContext, response: unknown) => void
  importFn?: (context: UiContext, model: unknown) => void
  exportFn?: (context: UiContext, model: unknown) => void
}

/** 列表多选里只有 deletable !== false 且有 id 的行可以提交删除。 */
export function deletableSelectedItems<E extends Entity>(
  items: readonly E[] | undefined | null,
): E[] {
  return (items ?? []).filter((item) => {
    if (item == null) return false
    const entity = item as Entity
    if (entity.deletable === false) return false
    return entity.id != null && String(entity.id) !== ''
  })
}

const SELECT_READONLY_AUTH: ModuleAuth = {
  allowRead: false,
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  allowPrint: false,
  allowExport: false,
  allowImport: false,
  allowUpload: false,
  allowDownload: false,
}

function resolveSelectAuthority(
  param: EntitySelectParam<Entity>,
  module: Module | undefined,
): ModuleAuth {
  if (param.authority) {
    return {
      ...SELECT_READONLY_AUTH,
      ...(module?.authority ?? {}),
      ...param.authority,
    }
  }
  if (module?.authority) return { ...module.authority }
  return { ...SELECT_READONLY_AUTH }
}

// ——— AbstractUiContext —————————————————————————>

export abstract class AbstractUiContext<M extends Entity = Entity>
  implements UiContext<M>
{
  // —— 子类必须声明为公共字段（构造器赋值）——————————>

  abstract model: M | M[]
  abstract metaUi: MetaUi
  abstract locale: string
  abstract loader?: () => Promise<M | M[]>
  abstract fieldLogics: Record<string, MetaUiFieldLogic<any>>
  abstract groupLogics: Record<string, MetaUiGroupLogic<any, any>>
  abstract logic: EntityLogic<M> | undefined
  abstract customActions: EntityAction[]
  abstract executing: boolean
  abstract isInDialog: boolean
  showDialog = false
  indexTableHost?: UiIndexTableHost
  moduleContext?: ModuleContext
  private _selectableFns = new Map<string, SelectableFn>()
  private _customManyActionHandles = new Map<string, (...args: unknown[]) => unknown>()
  private _selectableKey?: string
  private _groupActions: Record<string, UiAction[]> = {}
  filters: UiFilter[] = []
  customSearchFields: UiCustomSearchField[] = []
  searchMode: 'fuzzy' | 'named' = 'fuzzy'
  joinListMode = false
  private _captureLastQuery = false
  private _baseFilter = ''
  private _lastQuery?: Ref<EntityQuery | null>
  private _listLayoutRev?: Ref<number>
  private _pageLayoutRev?: Ref<number>
  currentTemplate: ReportTemplate | null = null
  templates: ReportTemplate[] = []

  /** 当前实体所属功能模块，等价于 `logic?.module`。 */
  get module(): Module | undefined {
    return this.logic?.module
  }

  /** 当前模块权限；编辑/删除再按当前行的 `editable` / `deletable` 折叠。 */
  getModuleAuth(
    entity: Record<string, any> = this.model as Record<string, any>,
  ): ModuleAuth | undefined {
    const authority = this.module?.authority
    if (!authority) return undefined
    return {
      ...authority,
      allowEdit: authority.allowEdit && entity.editable !== false,
      allowDelete: authority.allowDelete && entity.deletable !== false,
    }
  }

  /** 选择列表的「是否可选」谓词，按 key 注册；未注册默认全部可选。 */
  setSelectableFn(key: string, selectableFn: SelectableFn): void {
    this._selectableFns.set(key, selectableFn)
  }

  selectableFn(key: string): SelectableFn | undefined {
    return this._selectableFns.get(key)
  }

  /** 当前多选动作 key（selectMany 进来时记录）。 */
  setSelectableKey(key: string): void {
    this._selectableKey = key
  }

  get selectableKey(): string | undefined {
    return this._selectableKey
  }

  /** 多选动作回执，按 key 注册；confirmAction 在 many 视图里调用。 */
  setCustomManyActionHandleFn(
    key: string,
    handleFn: (...args: unknown[]) => unknown,
  ): void {
    this._customManyActionHandles.set(key, handleFn)
  }

  runCustomManyAction(key = this._selectableKey): unknown {
    const handle = key ? this._customManyActionHandles.get(key) : undefined
    if (!handle) return undefined
    return handle(this.selectedItems)
  }

  parent: UiContext<M> | undefined
  abstract cache: Map<string, AbstractUiContext<Entity>>
  cachePath = '@root'

  // 响应式状态：rx() 惰性创建，子类构造时先注入 rxFactory。
  private _loading?: Ref<boolean>
  private _error?: Ref<unknown>
  private _initializedState?: Ref<boolean>
  private _uploading?: Ref<boolean>
  private _pageNotice?: Ref<UiMessageProps | null>

  get loading(): Ref<boolean> {
    return (this._loading ??= this.rx(false))
  }
  get error(): Ref<unknown> {
    return (this._error ??= this.rx<unknown>(null))
  }
  get initializedState(): Ref<boolean> {
    return (this._initializedState ??= this.rx(!this.loader))
  }
  get uploading(): Ref<boolean> {
    return (this._uploading ??= this.rx(false))
  }
  /** 详情/编辑页页内消息条。皮肤 `message()` 写这里，builder 的 banner 从这里读。 */
  get pageNotice(): Ref<UiMessageProps | null> {
    return (this._pageNotice ??=
      this.rx(null) as unknown as Ref<UiMessageProps | null>)
  }
  abstract fieldOptions: Record<string, FieldSearchOptions>
  abstract validationState: Validation
  abstract actionLoadings: Record<string, boolean>

  // —— 子类提供（可选覆写）—————————————————————————>

  /** 状态变更后通知 UI 重绘。Vue 侧 no-op（reactive 自动追踪），React 侧 store.touch()。 */
  protected _notify(): void {}

  /** 取 model 的原始对象。Vue 侧 toRaw，React 侧恒等。 */
  protected _rawModel(obj: object): object {
    return obj
  }

  /** 文件信息解析钩子。vui 覆写为文件图标解析器；默认用文件名兜底。 */
  protected getFileInfo(templateFile: string): { fileName: string } {
    return { fileName: templateFile }
  }

  /** 存储的页大小钩子。默认 undefined（走逻辑缺省）。 */
  protected readStoredPageSize(): number | undefined {
    return undefined
  }

  /** 装载最近查询。默认 no-op。 */
  protected async loadLastQuery(): Promise<void> {}

  /** 保存最近查询。默认 no-op。 */
  protected async saveLastQuery(): Promise<void> {}

  /** 列表绘制度量。默认 no-op。 */
  protected logListPaint(_stage: string, _meta: Record<string, unknown>): void {}

  /** 重置列表绘制计数。默认 no-op。 */
  protected resetListPaintCount(): void {}

  /** 设置 loading 状态（统一走 `this.loading.value`）。 */
  protected _setLoading(v: boolean): void { this.loading.value = v }

  /** 设置 initializedState（统一走 `this.initializedState.value`）。 */
  protected _setInitialized(v: boolean): void { this.initializedState.value = v }

  /** 已发起过的关联查询缓存，防重复请求。vui 初始化在构造器，rui 与基类惰性创建。 */
  protected _referenceOptionLoads: Map<string, Promise<any[]>> = new Map()

  /** 翻译器。Vue 侧传 i18n.global.t，React 侧可用 react-i18next 或其他。 */
  protected translateFn: TranslateFn = identityTranslate

  /** 响应式工厂。vui / rui 构造时注入；未注入前 rx/computed/watch 抛错。 */
  protected rxFactory?: RxFactory
  /** 路由。实现侧注入 UiRouter；未注入时 navigate 无操作。 */
  protected router?: UiRouter

  // —— 构造器助手 ——————————————————————————————>

  protected initModel(
    raw: M | M[] | PagedList<M>,
    _editing: boolean,
  ): M | M[] {
    if (isPagedList(raw)) {
      return [...(raw as unknown as PagedList<M>).list] as M[]
    }
    if (Array.isArray(raw)) return [...raw] as M[]
    return { ...raw as object } as M
  }

  protected initValidation(
    childValidation: Validation | undefined,
  ): Validation {
    return childValidation ?? defineValidation(this.metaUi, this.model as Entity)
  }

  // —— 响应式 / 路由便捷方法（仅实现侧，不进 UiContext 契约）——

  rx<T>(val: T) {
    return this.requireRxFactory().rx(val)
  }

  computed<T>(fn: () => T) {
    return this.requireRxFactory().computed(fn)
  }

  protected makeRef<T>(value: T): Ref<T> {
    return this.requireRxFactory().ref(value)
  }

  /** 创建快捷过滤芯片。vui 覆写为 Vue 收窄子类，rui 用基类 + RxFactory。 */
  protected createUiFilter(metaUiFilter: MetaUiFilter): UiFilter {
    return new UiFilter(metaUiFilter, (value) => this.makeRef(value))
  }

  /** 创建自定义搜索字段。vui 覆写为 Vue 收窄子类。 */
  protected createCustomSearchField(
    field: EntityCustomSearchField,
  ): UiCustomSearchField {
    return new UiCustomSearchField(
      {
        defaultValue: field.defaultValue,
        searchLabel: field.searchLabel ?? '',
        searchParam: field.searchParam,
        renderer: field.renderer as UiCustomSearchField['renderer'],
        valueFn: field.valueFn,
      },
      (value) => this.makeRef(value),
    )
  }

  watch(source: RxWatchSource, cb: (val: unknown) => void) {
    return this.requireRxFactory().watch(source, cb)
  }

  navigate(path: string): void {
    this.router?.push(path)
  }

  private requireRxFactory(): RxFactory {
    const factory = this.rxFactory
    if (!factory) throw new Error('AbstractUiContext.rxFactory not wired')
    return factory
  }

  // —— UiContext 属性 ——————————————————————————>

  get title(): string | undefined {
    return this.getModelTitle()
  }

  get name(): string {
    return this.parent ? this.cachePath : '.'
  }

  get initialized(): boolean {
    return this.initializedState.value
  }

  get editing(): boolean {
    return false // 子类覆写
  }

  /** 当前视图（单/多对象）。vui / rui 构造时注入，基类据此派生 `many`。 */
  abstract get view(): UiViewType

  /** 当前屏是否为列表（many）视图。 */
  get many(): boolean {
    return (
      this.view === UiViewMany.Index ||
      this.view === UiViewMany.SelectOne ||
      this.view === UiViewMany.SelectMany ||
      this.view === UiViewMany.EditMany
    )
  }

  get $v(): Validation {
    return this.validationState
  }

  get root(): AbstractUiContext<Entity> {
    return (this.parent?.root ?? this) as unknown as AbstractUiContext<Entity>
  }

  get isRoot(): boolean {
    return !this.parent
  }

  get app(): MmdaApplication { throw new Error('Not implemented: app') }
  get apiClient(): ApiClient { throw new Error('Not implemented: apiClient') }
  get uiBuilder(): UiBuilder { throw new Error('Not implemented: uiBuilder') }

  abstract selectedItems: M[]
  abstract currentItem: M | null
  abstract currentIndex: number

  /** 列表选择模式的持久存储（vui / rui 各自落响应式状态）。 */
  protected abstract get selectionModeStorage(): 'single' | 'multiple' | null
  protected abstract set selectionModeStorage(
    mode: 'single' | 'multiple' | null,
  )

  private _selectionModeOverride?: 'single' | 'multiple' | null

  get selectionMode(): 'single' | 'multiple' | null {
    if (this.view === UiViewMany.SelectOne) return 'single'
    if (
      this.view === UiViewMany.SelectMany ||
      this.view === UiViewMany.EditMany
    ) {
      return 'multiple'
    }
    if (this._selectionModeOverride !== undefined) {
      return this._selectionModeOverride
    }
    return this.selectionModeStorage
  }

  set selectionMode(mode: 'single' | 'multiple' | null) {
    this._selectionModeOverride = mode
    this.selectionModeStorage = mode
  }

  get lastQuery(): Ref<EntityQuery | null> {
    return (this._lastQuery ??= this.makeRef<EntityQuery | null>(null))
  }
  set lastQuery(v: Ref<EntityQuery | null>) {
    this._lastQuery = v
  }

  get listLayoutRev(): Ref<number> {
    return (this._listLayoutRev ??= this.makeRef(0))
  }
  set listLayoutRev(v: Ref<number>) {
    this._listLayoutRev = v
  }

  get pageLayoutRev(): Ref<number> {
    return (this._pageLayoutRev ??= this.makeRef(0))
  }
  set pageLayoutRev(v: Ref<number>) {
    this._pageLayoutRev = v
  }

  // —— 列表查询状态（框架无关；vui / rui 共用）——————————

  /** 列表查询参数。惰性经 RxFactory 创建，vui 为 reactive、rui 为 valtio proxy。 */
  private _searchParam?: EntitySearchParam

  get searchParam(): EntitySearchParam {
    return (this._searchParam ??= this.rx(EntitySearchParam.create()))
  }
  set searchParam(v: EntitySearchParam | undefined) {
    this._searchParam = v
  }

  /** 搜索页条件行（草稿）。惰性经 RxFactory 创建；赋值走原地 splice，保住响应式引用。 */
  private _searchRows?: UiSearchRow[]

  get searchRows(): UiSearchRow[] {
    return (this._searchRows ??= this.rx([] as UiSearchRow[]))
  }

  set searchRows(rows: UiSearchRow[]) {
    const current = this.searchRows
    current.splice(0, current.length, ...rows)
  }

  /** 列表查询 URL 参数袋。 */
  getQueryParam(): Record<string, unknown> {
    return (this.searchParam.queryParams ??= {})
  }

  /** 追加/覆盖一个列表查询参数。 */
  addQueryParam(name: string, value: unknown): void {
    this.getQueryParam()[name] = value
    if (name === 'filter') this._baseFilter = String(value ?? '')
  }

  /** 按字段写 `filterModel`；`filter` 为空时删掉该字段条件。 */
  setFieldFilter(field: MetaUiField | string, filter?: FieldFilter): void {
    const name =
      typeof field === 'string' ? this.resolveField(field).fieldName : field.fieldName
    const model = (this.searchParam.filterModel ??= {})
    if (filter) model[name] = filter
    else delete model[name]
    if (Object.keys(model).length === 0) this.searchParam.filterModel = undefined
  }

  /** 应用一份外部搜索参数（URL / 选择弹层等）。 */
  applySearchParam(param: EntitySearchParam): EntitySearchParam {
    EntitySearchParam.assign(this.searchParam, param)
    this._baseFilter = String(this.searchParam.queryParams?.filter ?? '')
    for (const filter of this.filters) filter.selectedConditions.value = []
    this.syncSearchState()
    return this.searchParam
  }

  /** 标记本次列表查询结束后要保存为「上次查询」。 */
  rememberLastQuery(): void {
    this._captureLastQuery = true
  }

  /** 列表搜索装配：快捷过滤、缺省搜索参数、自定义搜索字段与「上次查询」。 */
  configureSearch(filters: MetaUiFilter[] = [], form?: UiSearchForm): void {
    this.filters = filters.map((filter) => {
      const uiFilter = this.createUiFilter(filter)
      uiFilter.selectedConditions.value = filter.filterConditions.filter(
        (condition) => condition.fallback,
      )
      return uiFilter
    })
    this.configureListSearch({
      searchParam: form?.searchParam,
      defaultSort: this.logic?.module?.defaultSort,
      defaultFilter: this.logic?.module?.defaultFilter,
      pageSize: this.readStoredPageSize(),
      queryParams: form?.queryParams,
    })
    void this.loadLastQuery()
    if (form?.queryParams?.filter) {
      this._baseFilter = String(form.queryParams.filter)
    }
    // Logic 只声明 plain 自定义搜索字段；运行时包装成带搜索状态的字段。
    if (form?.customSearchFields) {
      this.customSearchFields = form.customSearchFields.map((field) =>
        field instanceof UiCustomSearchField
          ? (field as UiCustomSearchField)
          : this.createCustomSearchField(field as EntityCustomSearchField),
      )
    }
    if (!this._baseFilter && this.searchParam.queryParams?.filter) {
      this._baseFilter = String(this.searchParam.queryParams.filter)
    }
    this.syncSearchState()
  }

  toggleQuickFilter(
    filter: UiFilter,
    condition: MetaUiFilterCondition,
    single = false,
  ): void {
    filter.toggle(condition, single)
    this.syncQuickFilters()
    this.rememberLastQuery()
  }

  /** 快捷过滤 → 查询参数 `filter`：每组先 OR，组间 AND，再与基础过滤合并。 */
  syncQuickFilters(): void {
    const quick = quickFiltersToSQL(this.filters)
    const query = this.getQueryParam()
    const combined =
      this._baseFilter && quick
        ? `(${this._baseFilter}) AND (${quick})`
        : this._baseFilter || quick
    if (combined) query.filter = combined
    else delete query.filter
  }

  /** 把自定义搜索字段的当前值同步回查询参数，再重算快捷过滤。 */
  syncSearchState(): void {
    for (const field of this.customSearchFields) {
      if (field.hasVal) {
        this.getQueryParam()[field.searchParam] = field.searchValue
      } else {
        delete this.getQueryParam()[field.searchParam]
      }
    }
    this.syncQuickFilters()
  }

  /** 清空列表过滤（入口）。 */
  clearFilters(): void {
    this.clearListFilters()
  }

  /** 清空列表过滤：快捷过滤、自定义搜索字段与纯 `searchParam` 部分。 */
  protected clearListFilters(): void {
    this.searchParam.searchWord = ''
    this.searchParam.filterModel = undefined
    for (const filter of this.filters) filter.selectedConditions.value = []
    for (const customField of this.customSearchFields) {
      if (customField.searchWord) customField.searchWord.value = null
      customField.searchVal.value = null
      delete this.getQueryParam()[customField.searchParam]
    }
    this.syncQuickFilters()
  }

  /** 单删后收尾：清模块缓存并回列表。 */
  protected afterDeleteCleanup(id: unknown, result: unknown): void {
    if (result !== false && !this.many && id != null && String(id) !== '') {
      this.moduleContext?.removeById(String(id))
      this.routeToIndex()
    }
  }

  protected asUiCtx(): UiContext<M> {
    return this as unknown as UiContext<M>
  }

  /** Logic 钩子统一收 UiContext（默认 Entity）：UiContext<M> 因 M 不变型不能直接协变，在此收敛一次。 */
  protected asEntityUiCtx(): UiContext {
    return this.asUiCtx() as unknown as UiContext
  }

  // —— i18n ——————————————————————————————————>

  translate(message: string, param?: Record<string, any>): string {
    const translated = this.translateFn({ message, param })
    return translated === message && !param
      ? this.translateFn(message)
      : translated
  }

  t(
    message: string | Translatable | undefined,
    param?: Record<string, any>,
  ): string {
    if (message == null || message === '') return ''
    if (typeof message === 'string') return this.translate(message, param)
    return this.translateFn(message)
  }

  getModelTitle(
    model: Record<string, any> = this.model as Record<string, any>,
  ): string {
    const key = this.metaUi.labelField ?? this.metaUi.primaryKey
    const label = key ? model[key] : undefined
    return label == null || label === ''
      ? this.metaUi.displayLabel
      : `${this.metaUi.displayLabel}【${String(label)}】`
  }

  // —— 字段 / 分组查找 ———————————————————————>

  resolveField(field: MetaUiField | string): MetaUiField {
    if (typeof field !== 'string') return field
    const resolved = this.metaUi.getField(field)
    if (!resolved) throw new Error(`Field "${field}" not found.`)
    return resolved
  }

  resolveGroup(group: MetaUiGroup | string): MetaUiGroup {
    if (typeof group !== 'string') return group
    const resolved = this.metaUi.getGroup(group)
    if (!resolved) throw new Error(`Group "${group}" not found.`)
    return resolved
  }

  getFieldLogic(
    field: MetaUiField | string,
  ): MetaUiFieldLogic<any> | undefined {
    const name = typeof field === 'string' ? field : field.fieldName
    return this.fieldLogics[name] ?? this.root.fieldLogics[name]
  }

  getGroupLogic(
    group: MetaUiGroup | string,
  ): MetaUiGroupLogic<any, any> | undefined {
    const name = typeof group === 'string' ? group : group.groupName
    const parentGroup = (
      this.logic as
        | { groupName?: string; repository?: string }
        | undefined
    )?.groupName ?? this.logic?.repository
    if (this.logic?.isChild && parentGroup) {
      const scoped = `${parentGroup}.${name}`
      return (
        this.groupLogics[scoped] ??
        this.root.groupLogics[scoped] ??
        this.groupLogics[name]
      )
    }
    return this.groupLogics[name] ?? this.root.groupLogics[name]
  }

  bindLogics(
    fields: MetaUiFieldLogic<M>[] = [],
    groups: MetaUiGroupLogic<M, Entity>[] = [],
    customActions: EntityAction[] = [],
  ): void {
    for (const f of fields) this.setupFieldLogic(f)
    for (const g of groups) this.setupGroupLogic(g)
    this.customActions = customActions
    if (this.view === UiViewOne.Search) this.initSearchRows(fields)
  }

  /**
   * 搜索视图的行装配：`beforeSearch().fields` 有声明就用它（含顺序），
   * 否则回落 {@link defaultSearchFields}（listed fields 里 `sortable === true`）。
   * 只在搜索视图落地 —— 其它视图的 `fields` 是字段逻辑，不是搜索行。
   */
  private initSearchRows(fields: MetaUiFieldLogic<M>[]): void {
    const declared = fields.map((item) => item.field.fieldName)
    const names = declared.length
      ? declared
      : defaultSearchFields(this.metaUi).map((field) => field.fieldName)
    this.searchRows = [...new Set(names)].map((fieldName) => ({ fieldName }))
  }

  setupFieldLogic(logic: MetaUiFieldLogic<any>): void {
    this.fieldLogics[logic.field.fieldName] = logic
  }

  setupGroupLogic(logic: MetaUiGroupLogic<any, any>): void {
    delete this._groupActions[logic.group.groupName]
    this.groupLogics[logic.group.groupName] = logic
  }

  /** 组动作缓存；重注册组逻辑时失效。 */
  getGroupActions(grp: MetaUiGroup): UiAction[] {
    this.setupGroupActions(grp)
    return (this._groupActions[grp.groupName] ?? []).filter((action) => {
      if (
        action.view &&
        action.view !== UiViewOne.Create &&
        action.view !== UiViewOne.Edit
      ) {
        return false
      }
      const visible = action.visible
      if (visible == null) return true
      if (typeof visible === 'function') return true
      if (typeof visible === 'object' && visible !== null && 'value' in visible) {
        return Boolean((visible as { value: boolean }).value)
      }
      return Boolean(visible)
    })
  }

  setupGroupActions(grp: MetaUiGroup) {
    const name = grp.groupName
    const actionsMap = this._groupActions
    if (actionsMap[name]) return

    const actions: UiAction[] = []
    actionsMap[name] = actions
    if (!this.editing) return

    const grpLogic = this.getGroupLogic(grp)
    if (!grpLogic) return

    const visibles = this.logic?.groupActionVisibles?.[name]
    const context = this

    const liveCanDo = (action: any) => {
      return (model: unknown, ctx?: unknown) => {
        if (this.isGroupReadonly(grp)) return false
        const pred = canDoFromExecutableExpression(action)
        return pred ? pred(model as Entity, ctx as unknown as UiContext) !== false : true
      }
    }

    const visibleOf = (actionName: string) =>
      visibles?.[actionName]
        ? this.computed(() => !!visibles[actionName]!(this.model as M, this))
        : undefined

    for (const std of grpLogic.stdActions ?? []) {
      if (std.name === 'clear') {
        actions.push({
          name: 'clear',
          icon: std.icon ?? 'clear',
          label: std.label ?? this.t('action.clear'),
          colorRole: 'danger',
          onAction: () => this.removeSubGroupItems(grp),
          view: UiViewOne.Edit,
          canDo: liveCanDo(std),
          visible: visibleOf('clear'),
        })
      } else if (std.name === 'add') {
        actions.push({
          name: 'add',
          role: 'secondary',
          icon: std.icon ?? 'plus',
          label: std.label ?? this.t('action.add'),
          colorRole: 'primary',
          onAction: () => this.runGroupAdd(grp, grpLogic),
          view: UiViewOne.Edit,
          canDo: liveCanDo(std),
          visible: visibleOf('add'),
        })
      }
    }

    if (grpLogic.customActions?.length) {
      for (const a of grpLogic.customActions) {
        const uiAction: UiAction = {
          name: a.name,
          icon: a.icon,
          label: a.label,
          colorRole: a.role as UiColorRole,
          onAction: () => a.onAction!.apply(this.logic, [context, context.model]),
          tooltip: a.description,
          view: a.view ?? context.view,
          canDo: liveCanDo(a),
        }
        if (a.visible) {
          uiAction.visible = this.computed(() => !!a.visible!(context.model))
        }
        actions.push(uiAction)
      }
    }
  }

  async runGroupAdd(grp: MetaUiGroup, grpLogic: MetaUiGroupLogic<any, any>) {
    if (typeof grpLogic.defaultAddFn === 'function') {
      return grpLogic.defaultAddFn.apply(this.logic, [this, this.model])
    }
    const items = (this.model as Record<string, any>)[grp.groupName] ?? []
    if (typeof grpLogic.beforeAddFn === 'function') {
      const ok = await grpLogic.beforeAddFn(this.asEntityUiCtx(), this.model, items)
      if (ok === false) return
    }
    const created = await this.createSubGroupItems({
      group: grp,
      target: this.model as Entity,
    })
    const list = Array.isArray(created) ? created : [created]
    for (const item of list) this.addSubGroupItem(grp, item)
  }

  // —— 字段读写 ————————————————————————————>

  getFieldValue(field: MetaUiField | string, model?: M): any {
    const fld = this.resolveField(field)
    const row = sessionRow(this.model, model)
    if (row == null) return undefined
    return MetaModel.getFieldValue(row, fld)
  }

  displayField(field: MetaUiField | string, model?: M): any {
    const fld = this.resolveField(field)
    const row = sessionRow(this.model, model)
    if (row == null) return undefined
    return MetaModel.displayField(row, fld)
  }

  setFieldValue(field: MetaUiField | string, value: any): void {
    const fld = this.resolveField(field)
    const model = this.model as Record<string, any>
    const oldValue = MetaModel.getFieldValue(model, fld)
    const normalized = typeof value === 'string' ? value.trim() : value
    const validationValue =
      normalized && typeof normalized === 'object' && fld.reference
        ? fld.reference.valueOf(normalized)
        : normalized
    this.validateSingleField(
      fld,
      validationValue,
      model,
      this.validationState,
    )
    const modified = MetaModel.setFieldValue(model, fld, normalized)
    if (!modified) return
    const options = this.getFieldSearchOptions(fld)
    if (fld.reference && normalized && typeof normalized === 'object') {
      options.currentSelectOption = normalized
      if (!options.selectOptions.includes(normalized)) {
        options.selectOptions.push(normalized)
      }
    }
    this.getFieldLogic(fld)?.onChangeFn?.(
      this.asEntityUiCtx(),
      this.model,
      value,
      oldValue,
    )
    this._notify()
  }

  // —— 字段搜索选项 ———————————————————————>

  getFieldSearchOptions(field: MetaUiField | string): FieldSearchOptions {
    const fld = this.resolveField(field)
    return (this.fieldOptions[fld.fieldName] ??= defaultFieldSearchOptions(
      this.getFieldValue(fld),
    ))
  }

  getFieldSelectedOption(field: MetaUiField | string): any {
    return this.getFieldSearchOptions(field).currentSelectOption
  }

  setFieldSearchParam(
    field: MetaUiField | string,
    patch: Partial<EntitySearchParam>,
  ): void {
    Object.assign(this.getFieldSearchOptions(field).searchParam, patch)
  }

  batchSetFieldValue(values: Record<string, any>): void {
    for (const [field, value] of Object.entries(values)) {
      this.setFieldValue(field, value)
    }
  }

  clearFieldValue(field: MetaUiField | string): void {
    const fld = this.resolveField(field)
    const options = this.getFieldSearchOptions(fld)
    options.searchParam.searchWord = ''
    options.currentSelectOption = undefined
    this.setFieldValue(fld, null)
    const ref = fld.reference
    if (ref) {
      const model = this.model as Record<string, any>
      MetaModel.setRefProp(model, fld.fieldName, null)
      ref.refFlds.forEach((rf, index) => {
        if (index > 0) MetaModel.delCustomProp(model, rf)
      })
      if (ref.hasOne && ref.alias) model[ref.alias] = null
    }
  }

  // —— 只读 / 隐藏 / 必填 ————————————>

  isFieldReadonly(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field)
    return (
      !!fld.readOnly ||
      !!this.getFieldLogic(fld)?.readonlyFn?.(
        this.model,
        this.asEntityUiCtx(),
      )
    )
  }

  isFieldHidden(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field)
    return (
      !!fld.hidden ||
      !!this.getFieldLogic(fld)?.hiddenFn?.(
        this.model,
        this.asEntityUiCtx(),
      )
    )
  }

  isFieldRequired(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field)
    return (
      !fld.nullable ||
      !!this.getFieldLogic(fld)?.requiredFn?.(
        this.model,
        this.asEntityUiCtx(),
      )
    )
  }

  isGroupReadonly(group: MetaUiGroup | string): boolean {
    const grp = this.resolveGroup(group)
    return (
      !!grp.readOnly ||
      !!this.getGroupLogic(grp)?.readonlyFn?.(
        this.model,
        this.asEntityUiCtx(),
      )
    )
  }

  isGroupHidden(group: MetaUiGroup | string): boolean {
    const grp = this.resolveGroup(group)
    if (
      this.getGroupLogic(grp)?.hiddenFn?.(
        this.model,
        this.asEntityUiCtx(),
      )
    )
      return true
    if (grp.canHave) {
      const master = (
        (this.root ?? this).model ?? {}
      ) as Record<string, any>
      return !master[grp.canHave]
    }
    return false
  }

  isSubGroupItemDeletable(
    group: MetaUiGroup | string,
    item: Entity,
  ): boolean {
    if (item.deletable === false) return false
    const grp = this.resolveGroup(group)
    const fn = this.getGroupLogic(grp)?.itemDeletableFunc
    if (!fn) return true
    const master = (
      (this.root ?? this).model ?? {}
    ) as Record<string, any>
    return fn(item, master, this.asEntityUiCtx()) !== false
  }

  validateSingleField(
    field: MetaUiField,
    value: any,
    model: Record<string, any>,
    validation: Validation,
  ): number {
    if (this.isFieldHidden(field) || this.isFieldReadonly(field)) return 0
    const result = validateFieldResult(
      field,
      value,
      model,
      this.asEntityUiCtx(),
    )
    const state = (validation[field.fieldName] ??= {
      touched: false,
      message: '',
      warning: '',
    }) as FieldValidation
    state.touched = true
    state.message = result.errors.join('；')
    state.warning = result.warnings.join('；')
    return result.errors.length ? 1 : 0
  }

  countValidationErrors(value: unknown): number {
    if (!value || typeof value !== 'object') return 0
    if ('touched' in value && 'message' in value) {
      return (value as FieldValidation).message ? 1 : 0
    }
    return Object.entries(value).reduce(
      (count, [key, child]) =>
        key === 'summary'
          ? count
          : count + this.countValidationErrors(child),
      0,
    )
  }

  // —— 会话树 ——————————————————————————————>

  protected rowCacheKey(
    model: object,
    cacheKey: string,
    fallbackKey?: string,
  ): string {
    const record = model as Record<string, any>
    const value =
      record[cacheKey] ??
      (fallbackKey ? record[fallbackKey] : undefined)
    if (value != null && value !== '') return String(value)
    // 无 ID 的行用 WeakMap 分配临时键
    return this._unsavedRowKey(model)
  }

  private readonly _unsavedRows = new WeakMap<object, string>()
  private _unsavedRowSequence = 0

  private _unsavedRowKey(model: object): string {
    let key = this._unsavedRows.get(model)
    if (!key) {
      key = `new-${++this._unsavedRowSequence}`
      this._unsavedRows.set(model, key)
    }
    return key
  }

  with<G extends Entity>(
    model: G,
    cacheKey = 'id',
  ): UiContext<G> {
    const rowKey = this.rowCacheKey(
      model,
      cacheKey,
      this.metaUi.primaryKey,
    )
    const path = `${this.cachePath}/@row/${rowKey}`
    const cached = this.cache.get(path)
    if (cached) {
      if (
        this._rawModel(cached.model as object) !==
        this._rawModel(model as object)
      ) {
        this.cache.delete(path)
      } else {
        return cached as unknown as UiContext<G>
      }
    }
    return this.createChild(model, this.metaUi, path) as unknown as UiContext<G>
  }

  release(model: object, cacheKey = 'id'): void {
    const rowKey = this.rowCacheKey(
      model,
      cacheKey,
      this.metaUi.primaryKey,
    )
    this.cache.delete(`${this.cachePath}/@row/${rowKey}`)
  }

  treeWith<G extends Entity>(
    model: G,
    cacheKey = 'id',
  ): UiContext<G> {
    return this.with(model, cacheKey)
  }

  cachedContext(cacheKey = '@root'): UiContext<M> | undefined {
    return this.cache.get(
      cacheKey.startsWith('@')
        ? cacheKey
        : `${this.cachePath}/${cacheKey}`,
    ) as unknown as UiContext<M> | undefined
  }

  /** 缓存中的上下文总数（含自身与子表/行上下文）。 */
  get contextCount(): number {
    return this.cache.size
  }

  /** 按主键在缓存树里找已建上下文。 */
  cachedContextByID(id: string): UiContext<Entity> | undefined {
    for (const context of this.cache.values()) {
      const model = context.model as Record<string, unknown> | undefined
      if (model == null || Array.isArray(model)) continue
      const key = context.metaUi.primaryKey ?? 'id'
      if (String(model[key] ?? model.id) === String(id)) {
        return context as unknown as UiContext<Entity>
      }
    }
    return undefined
  }

  beginEditRow(item: M, cacheKey?: string): UiContext<M> {
    return this.with(item, cacheKey)
  }

  endEditRow(item: M, cacheKey?: string): void {
    this.release(item, cacheKey)
  }

  /** 创建子上下文。抽象：Vue/React 各自 new 自己的类。 */
  abstract createChild<G extends Entity>(
    model: G | G[],
    metaUi: MetaUi,
    cachePath: string,
    view?: UiViewType,
    fieldLogics?: Record<string, MetaUiFieldLogic<any>>,
    logic?: EntityLogic<G>,
  ): AbstractUiContext<G>

  resolveSubGroupTransform<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ) {
    return {
      metaUiGroup: this.resolveGroup(param.group),
      source: param.source,
      target: param.target ?? this.model,
      creator: param.creator ?? ((o: object) => o as G),
      propsMapper: param.propsMapper,
      ignoreMapper: param.ignoreMapper,
      sequenceKey: param.sequenceKey,
    }
  }

  // —— 数据加载 ———————————————————————————>

  async load(): Promise<void> {
    if (!this.loader) {
      this.initializedState.value = true
      return
    }
    this.loading.value = true
    try {
      this.setModel(await this.loader())
      this.initializedState.value = true
    } finally {
      this.loading.value = false
    }
  }

  /** 首次初始化当前会话：装载元数据、应用视图逻辑，再按视图走 search / create / refresh。 */
  async init(params?: EntityUrlParam): Promise<unknown> {
    if (!this.logic) return undefined
    await this.logic.initMetadata(false, params)
    const logicResult = await this.logic.applyTo(this, this.view)
    if (this.many) {
      this.configureSearch(undefined, {
        customSearchFields: logicResult?.customSearchFields ?? [],
      })
    }
    if (this.many) return this.search()
    if (this.view === UiViewOne.Create) {
      const created = await this.logic.create(params?.queryParams ?? {})
      if (created) this.setModel(created)
      return created
    }
    return this.refresh(false)
  }

  /** 重新装载元数据；列表视图同步重配搜索装配。 */
  async initMetadata(reload = false, params?: EntityUrlParam): Promise<unknown> {
    if (!this.logic) return undefined
    const metaUi = await this.logic.initMetadata(reload, params)
    if (this.logic.metaUi) {
      this.metaUi = this.logic.metaUi
    }
    if (this.many) {
      this.configureSearch(undefined)
    }
    return metaUi
  }

  abstract setModel(model: M | M[]): void

  // —— 列表查询（框架无关；vui / rui 共用模板）————————>

  /** 列表查询前：同步自定义搜索字段，重置并记录列表绘制度量。 */
  protected beforeListSearch(): void {
    this.syncSearchState()
    this.resetListPaintCount()
    this.logListPaint('search-start', {
      searchWord: this.searchParam.searchWord,
      pageNo: this.searchParam.pager?.pageNo,
      listLen: Array.isArray(this.model) ? this.model.length : 0,
      loading: this.loading.value,
    })
  }

  /** 取一页列表数据。默认 `logic.getAll(searchParam)`；vui 可按 viewUi 切 joinList。 */
  protected fetchListPage(): Promise<unknown> {
    const useJoinList = this.joinListMode && !!this.logic!.viewUi
    return useJoinList
      ? this.logic!.getJoinList(this.searchParam)
      : this.logic!.getAll(this.searchParam)
  }

  /** 查询成功后回写数据。 */
  protected afterListSearch(page: unknown): void {
    const list = (page as { list?: unknown[] })?.list
    this.logListPaint('search-setModel', {
      pageNo:
        (page as { pagination?: { pageNo?: number } })?.pagination?.pageNo ??
        this.searchParam.pager?.pageNo,
      listLen: Array.isArray(list) ? list.length : undefined,
    })
    if (page) this.setModel(page as M | M[])
    if (this._captureLastQuery) {
      this._captureLastQuery = false
      void this.saveLastQuery()
    }
  }

  /** 查询 finally 收尾。 */
  protected afterListSearchFinally(): void {
    this.logListPaint('search-end', { loading: this.loading.value })
  }

  /** 列表查询缺省装配（框架无关）：外部搜索参数、默认排序/过滤、页大小、URL 参数袋。 */
  protected configureListSearch(options: {
    searchParam?: EntitySearchParam
    defaultSort?: string
    defaultFilter?: string
    pageSize?: number
    queryParams?: Record<string, unknown>
  } = {}): void {
    if (options.searchParam) {
      EntitySearchParam.assign(this.searchParam, options.searchParam)
    }
    if (options.defaultSort && !this.searchParam.pager.sorts?.length) {
      this.searchParam.pager.sorts = EntityQuery.parseDefaultSort(options.defaultSort)
    }
    const defaults = DefaultFieldFilter.parse(options.defaultFilter)
    if (defaults.length) {
      this.searchParam.filterModel = DefaultFieldFilter.applySelfToModel(
        this.searchParam.filterModel,
        defaults,
        (name) => this.metaUi.getField(name),
      )
    }
    if (options.pageSize != null) {
      this.searchParam.pager.pageSize = options.pageSize
    }
    if (options.queryParams) {
      Object.assign(this.getQueryParam(), options.queryParams)
    }
  }

  async search(param?: EntitySearchParam): Promise<unknown> {
    if (!this.logic) return
    if (param) this.applySearchParam(param)
    this.beforeListSearch()
    this.error.value = null
    this._setLoading(true)
    try {
      const page = await this.fetchListPage()
      this.afterListSearch(page)
      return page
    } catch (e) {
      this.error.value = e
      throw e
    } finally {
      this._setLoading(false)
      this.afterListSearchFinally()
    }
  }

  async resetFilters(): Promise<boolean> {
    const selected = this.selectedItems
    if (this.logic) {
      const ok = await this.logic.beforeResetFilters?.(this.asEntityUiCtx(), selected)
      if (ok === false) return false
    }
    this.clearListFilters()
    if (this.logic) {
      await this.logic.afterResetFilters?.(this.asEntityUiCtx(), selected)
      await this.search()
    }
    return true
  }

  reload(): Promise<unknown> | unknown {
    if (!this.logic) return
    return this.many ? this.search() : this.refresh()
  }
  async save(): Promise<unknown> {
    if (!this.logic) return
    if (this.logic.beforeSave) {
      const ok = await this.logic.beforeSave(this.asEntityUiCtx(), this.model as M)
      if (ok === false) return false
    }
    if (this.logic.beforeValidate) {
      const ok = await this.logic.beforeValidate(this.asEntityUiCtx(), this.model as M)
      if (ok === false) return false
    }
    const valid = await this.validate()
    if (!valid) {
      const messages = this.collectInvalidMessages?.() ?? []
      await this.uiBuilder?.message?.(this.asEntityUiCtx(), {
        severity: 'error',
        content: messages.length > 0 ? messages.join('；') : this.translate('invalid.model'),
      })
      return false
    }
    const remoteErrors = await this.logic.afterValidate?.(this.asEntityUiCtx(), this.model as M, this.$v)
    if (remoteErrors && remoteErrors > 0) {
      const messages = this.collectInvalidMessages?.() ?? []
      await this.uiBuilder?.message?.(this.asEntityUiCtx(), {
        severity: 'error',
        content: messages.length > 0 ? messages.join('；') : this.translate('failure.beforeSave'),
      })
      return false
    }
    const result = await this.logic.save(this.model as M)
    if (result && typeof result === 'object') this.setModel(result)
    await this.logic.afterSave?.(this.asEntityUiCtx(), this.model as M, undefined, result)
    await this.uiBuilder?.message?.(this.asEntityUiCtx(), {
      severity: 'success',
      content: this.translate('success.saved'),
    })
    return result
  }

  async delete(): Promise<unknown> {
    if (!this.logic) return
    if (this.logic.beforeDelete) {
      const ok = await this.logic.beforeDelete(this.asEntityUiCtx(), this.model as M)
      if (ok === false) return false
    }
    const id = (this.model as Entity).id
    const result = await this.logic.delete(id)
    await this.logic.afterDelete?.(this.asEntityUiCtx(), this.model as M, undefined, result)
    this.afterDeleteCleanup(id, result)
    return result
  }

  /** 批量删除：`ids` 与 selectedItems 取交集，只删 `deletable !== false` 且有 id 的行。 */
  async deleteAll(ids: string[]): Promise<unknown> {
    if (!this.logic) return
    const idSet = new Set((ids ?? []).map((id) => String(id)))
    const selected = deletableSelectedItems(
      this.selectedItems.length
        ? (this.selectedItems as Entity[])
        : (ids ?? []).map((id) => ({ id }) as unknown as Entity),
    ).filter((item) => idSet.has(String(item.id)))
    const deletableIds = selected.map((item) => String(item.id))
    if (!deletableIds.length) return false

    if (deletableIds.length === 1) {
      const item = selected[0]! as M
      if (this.logic.beforeDelete) {
        const ok = await this.logic.beforeDelete(this.asEntityUiCtx(), item)
        if (ok === false) return false
      }
      const result = await this.logic.delete(deletableIds[0])
      await this.logic.afterDelete?.(this.asEntityUiCtx(), item, undefined, result)
      this.selectedItems = []
      await this.reload()
      return result
    }

    const models = selected as M[]
    if (this.logic.beforeDeleteAll) {
      const ok = await this.logic.beforeDeleteAll(this.asEntityUiCtx(), models)
      if (ok === false) return false
    }
    const result = await this.logic.deleteAll(deletableIds)
    await this.logic.afterDeleteAll?.(this.asEntityUiCtx(), models)
    this.selectedItems = []
    await this.reload()
    return result
  }

  /** 执行实体自定义动作（工具栏业务动作）。 */
  async doAction(action: EntityAction): Promise<unknown> {
    if (!this.logic) return
    if (this.executing) return
    this.executing = true
    this.actionLoadings[action.name] = true
    try {
      if (this.logic.beforeAction) {
        const ok = await this.logic.beforeAction(this.asEntityUiCtx(), this.model as M, action)
        if (ok === false) return false
      }
      const result = await this.logic.doAction(this.model as M, action)
      await this.logic.afterAction?.(this.asEntityUiCtx(), this.model as M, action, result)
      if (action.redirectTo) {
        await this.doRedirectAction(action)
      } else if (result !== false && !this.many) {
        await this.reload()
      }
      return result
    } finally {
      this.executing = false
      this.actionLoadings[action.name] = false
    }
  }

  async doRedirectAction(action: EntityAction): Promise<unknown> {
    if (!action.redirectTo || !this.router) return
    return this.router.push(action.redirectTo)
  }

  async print(): Promise<unknown> {
    if (!this.logic) return
    const ok = await this.logic.beforePrint?.(this.asEntityUiCtx(), this.model as M)
    if (ok === false) return false
    this.triggerPrint()
    await this.logic.afterPrint?.(this.asEntityUiCtx(), this.model as M)
    return true
  }

  /** 打印动作：默认走浏览器 `window.print`。 */
  protected triggerPrint(): void {
    if (typeof window !== 'undefined') window.print()
  }

  assignPaged(page: PagedList<M>): void {
    this.setModel(page as unknown as M | M[])
  }

  savable(): boolean {
    if (!this.logic) return false
    return MetaModel.savable(
      this.metaUi,
      this.model,
      this.logic.getSimplifyOptions(),
    )
  }

  // —— 文件传输（框架无关；皮肤动作直接走 context）——————>

  async uploadFile(file: File, options: FileTransferOptions = {}): Promise<unknown> {
    if (!this.logic) return
    const ok = await this.logic.beforeUpload?.(this.asEntityUiCtx(), this.model as M, file)
    if (ok === false) return false
    const result = await this.logic.uploadFile(file, options)
    await this.logic.afterUpload?.(this.asEntityUiCtx(), this.model as M, undefined, result)
    return result
  }

  async uploadFiles(files: File[], options: FileTransferOptions = {}): Promise<unknown> {
    if (!this.logic) return
    const ok = await this.logic.beforeUpload?.(this.asEntityUiCtx(), this.model as M, files)
    if (ok === false) return false
    const result = await this.logic.uploadFiles(files, options)
    await this.logic.afterUpload?.(this.asEntityUiCtx(), this.model as M, undefined, result)
    return result
  }

  async importFile(options: FileTransferOptions = {}): Promise<unknown> {
    if (!this.logic) return
    if (!options.file) throw new Error('importFile requires options.file.')
    const ok = await this.logic.beforeImport?.(this.asEntityUiCtx(), this.model as M, options.file)
    if (ok === false) return false
    const result = await this.logic.importFile(options.file, options)
    options.importFn?.(this.asEntityUiCtx(), result)
    options.handlerFn?.(this.asEntityUiCtx(), result)
    await this.logic.afterImport?.(this.asEntityUiCtx(), this.model as M, undefined, result)
    await this.reload()
    return result
  }

  async importFiles(options: FileTransferOptions = {}): Promise<unknown> {
    if (!this.logic) return
    if (!options.files) throw new Error('importFiles requires options.files.')
    const ok = await this.logic.beforeImport?.(this.asEntityUiCtx(), this.model as M, options.files)
    if (ok === false) return false
    const result = await this.logic.importFiles(options.files, options)
    options.importFn?.(this.asEntityUiCtx(), result)
    options.handlerFn?.(this.asEntityUiCtx(), result)
    await this.logic.afterImport?.(this.asEntityUiCtx(), this.model as M, undefined, result)
    await this.reload()
    return result
  }

  async exportFile(options: FileTransferOptions = {}): Promise<unknown> {
    if (!this.logic) return
    const result = await this.logic.exportFile(
      (this.model as Entity).id,
      options,
      options.body,
    )
    options.exportFn?.(this.asEntityUiCtx(), result)
    options.handlerFn?.(this.asEntityUiCtx(), result)
    return result
  }

  async exportFiles(options: FileTransferOptions = {}): Promise<unknown> {
    if (!this.logic) return
    const result = this.useJoinListExport()
      ? await this.logic.exportJoinList(options, options.body ?? this.searchParam)
      : await this.logic.exportFiles(options, options.body)
    options.exportFn?.(this.asEntityUiCtx(), result)
    options.handlerFn?.(this.asEntityUiCtx(), result)
    return result
  }

  /** 列表导出是否走 joinList 通道。 */
  protected useJoinListExport(): boolean {
    return this.joinListMode
  }

  async getTemplates(repository = this.logic?.repository): Promise<ReportTemplate[]> {
    if (!this.logic) return this.templates
    if (this.templates.length) return this.templates
    const list = await this.logic.getReportTemplates?.(repository)
    this.templates = (list ?? []) as ReportTemplate[]
    return this.templates
  }

  async uploadAttachment(attachment: Attachment, options: EntityUrlParam = {}): Promise<unknown> {
    return this.postFilesAction(
      options.action ?? 'uploadAttachment',
      attachment,
      { ...options, path: options.path ?? (this.model as Entity).id },
    )
  }

  async uploadAttachments(attachments: Attachment[], options: EntityUrlParam = {}): Promise<unknown> {
    return this.postFilesAction(
      options.action ?? 'uploadAttachments',
      attachments,
      { ...options, path: options.path ?? (this.model as Entity).id },
    )
  }

  async uploadTemplate(template: ReportTemplate, options: EntityUrlParam = {}): Promise<unknown> {
    this.currentTemplate = template
    return this.postFilesAction(options.action ?? 'uploadTemplate', template, options)
  }

  async uploadTemplates(templates: ReportTemplate[], options: EntityUrlParam = {}): Promise<unknown> {
    return this.postFilesAction(options.action ?? 'uploadTemplates', templates, options)
  }

  async downloadTemplate(template: ReportTemplate, options: EntityUrlParam = {}): Promise<unknown> {
    if (!this.logic) return
    const blob = await this.logic.postBlob({
      action: options.action ?? 'downloadTemplate',
      repository: options.repository ?? this.logic.repository,
      service: options.service,
      queryParams: {
        templateID: template.templateID,
        ...(options.queryParams ?? {}),
      },
    })
    this.triggerDownload(blob, this.resolveDownloadFileName(template.templateFile))
    return blob
  }

  /** 下载文件名推导：默认直接使用模板文件路径；皮肤可按文件类型表补中文名。 */
  protected resolveDownloadFileName(templateFile: string): string {
    return this.getFileInfo(templateFile).fileName
  }

  protected async postFilesAction(
    action: string,
    body: unknown,
    options: EntityUrlParam,
  ): Promise<unknown> {
    if (!this.logic) return
    const ok = await this.logic.beforeUpload?.(this.asEntityUiCtx(), this.model as M, body)
    if (ok === false) return false
    this.uploading.value = true
    try {
      const result = await this.logic.invokeAction(
        {
          action,
          path: options.path,
          queryParams: options.queryParams,
          repository: options.repository ?? this.logic.repository,
          service: options.service ?? 'files',
        },
        body,
      )
      await this.logic.afterUpload?.(this.asEntityUiCtx(), this.model as M, undefined, result)
      return result
    } finally {
      this.uploading.value = false
    }
  }

  protected triggerDownload(blob: Blob, fileName: string): void {
    if (typeof document === 'undefined') return
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    link.style.display = 'none'
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(blobUrl)
  }

  async refresh(reloadMetadata = false, setLoading = true): Promise<void> {
    if (!this.logic) return
    if (setLoading) this._setLoading(true)
    try {
      if (reloadMetadata) await this.logic.initMetadata(true)
      if (this.logic.beforeLoad) await this.logic.beforeLoad(this.asEntityUiCtx(), this.model as M)
      const id = (this.model as Entity).id
      if (id) {
        const loaded = await this.logic.load(id)
        if (loaded) this.setModel(loaded)
      }
      await this.logic.afterLoad?.(this.asEntityUiCtx(), this.model as M)
    } finally {
      this._setLoading(false)
    }
  }
  
  async validate(): Promise<boolean> {
    let valid = true
    for (const group of this.metaUi.groups) {
      if ((await this.validateGroup(group)) > 0) valid = false
    }
    const summary = (this.validationState.summary ??= { errorNum: 0 })
    summary.errorNum = valid
      ? 0
      : this.countValidationErrors(this.validationState)
    return valid
  }

  validateField(field: MetaUiField | string, value = this.getFieldValue(field)): number {
    const fld = this.resolveField(field)
    return this.validateSingleField(fld, value, this.model as Record<string, any>, this.validationState)
  }

  async validateGroup(group: MetaUiGroup | string): Promise<number> {
    const grp = this.resolveGroup(group)
    if (this.isGroupHidden(grp) || grp.readOnly) return 0
    if (!grp.many) {
      return grp.fields?.reduce(
        (count, field) =>
          count + this.validateSingleField(field, this.getFieldValue(field), this.model as Record<string, any>, this.validationState),
        0,
      ) ?? 0
    }
    const rows = ((this.model as Record<string, any>)[grp.groupName] as Record<string, any>[]) ?? []
    const groupState = (this.validationState[grp.groupName] ??= defineGroupValidation(grp, rows as Entity[])) as Validation
    let errorCount = groupState.summary?.errorNum ?? 0
    rows.forEach((row, index) => {
      const rowKey = String(row.rowNum ?? row.id ?? index)
      const rowState = (groupState[rowKey] ??= { rowNum: rowKey, summary: { errorNum: 0 } }) as Validation
      const rowContext = this.subGroupItemContext(grp, row as unknown as Entity)
      let rowErrors = 0
      for (const field of grp.groupUi?.groups.flatMap((g: MetaUiGroup) => g.fields ?? []) ?? []) {
        rowErrors += (rowContext as AbstractUiContext).validateSingleField?.(field, rowContext.getFieldValue(field), row, rowState) ?? 0
      }
      const summary = (rowState.summary ??= { errorNum: 0 })
      summary.errorNum = rowErrors
      errorCount += rowErrors
    })
    return errorCount
  }

  resetValidation(): void {
    for (const state of Object.values(this.validationState)) {
      if (state && typeof state === 'object' && 'touched' in state) {
        (state as FieldValidation).touched = false
        ;(state as FieldValidation).message = ''
        if ('warning' in state) (state as FieldValidation).warning = ''
      }
    }
  }

  hasFieldError(field: MetaUiField | string): boolean {
    return this.getInvalidMessage(field) !== ''
  }

  isInvalid(field: MetaUiField | string): boolean {
    const state = this.validationState[this.resolveField(field).fieldName]
    return !!(state && typeof state === 'object' && 'touched' in state && (state as FieldValidation).touched && (state as FieldValidation).message)
  }

  getInvalidMessage(field: MetaUiField | string): string {
    const state = this.validationState[this.resolveField(field).fieldName]
    return state && typeof state === 'object' && 'message' in state && typeof (state as FieldValidation).message === 'string'
      ? ((state as FieldValidation).message ?? '')
      : ''
  }

  setFieldError(field: MetaUiField | string, error: string): void {
    const name = this.resolveField(field).fieldName
    const state = (this.validationState[name] ??= { touched: true, message: '' }) as FieldValidation
    state.touched = true
    state.message = error
  }

  hasGroupError(group: MetaUiGroup | string): boolean {
    const state = this.validationState[this.resolveGroup(group).groupName]
    return this.countValidationErrors(state) > 0
  }

  collectInvalidMessages(value: unknown = this.validationState): string[] {
    if (!value || typeof value !== 'object') return []
    if ('touched' in value && 'message' in value) {
      const message = (value as FieldValidation).message
      return message ? [this.translate(String(message))] : []
    }
    const out: string[] = []
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'summary' || key === 'rowNum') continue
      if (child && typeof child === 'object' && 'touched' in child && 'message' in child) {
        const message = (child as FieldValidation).message
        if (!message) continue
        let label = key
        try {
          const field = this.resolveField(key)
          label = this.t(field.displayLabel) || key
        } catch { /* nested */ }
        out.push(`${label}：${this.translate(String(message))}`)
        continue
      }
      out.push(...this.collectInvalidMessages(child))
    }
    return out
  }
  /** 参数是否为「字段选择」（写回字段）而非「仓库选择」。 */
  protected isFieldSelect(
    fieldOrParam: unknown,
  ): fieldOrParam is MetaUiField | string {
    if (typeof fieldOrParam === 'string') return true
    const field = fieldOrParam as MetaUiField | null | undefined
    return (
      !!field &&
      typeof field.fieldName === 'string' &&
      !('repository' in (field as object))
    )
  }

  select(field: MetaUiField | string): Promise<Entity | false>
  select<T extends Entity>(param: EntitySelectParam<T>): Promise<boolean | T[]>
  async select<T extends Entity = Entity>(
    fieldOrParam: MetaUiField | string | EntitySelectParam<T>,
  ): Promise<Entity | false | boolean | T[]> {
    if (this.isFieldSelect(fieldOrParam)) {
      return this.selectByField(fieldOrParam)
    }
    const param = fieldOrParam as EntitySelectParam<T>
    if (!this.app || !this.uiBuilder) return false

    const service = param.service ?? this.app.name ?? 'base'
    const metaUi = await this.app.meta.get(param.repository, param.service)
    const objName = metaUi.objName
    const foundModule =
      this.app.findModule?.(objName) ??
      this.app.meta.findModule?.(objName) ??
      undefined
    const authority = resolveSelectAuthority(param, foundModule)
    const module: Module = foundModule
      ? { ...foundModule, authority: { ...foundModule.authority, ...authority } }
      : ({
          moduleCode: objName,
          moduleLabel: metaUi.displayLabel ?? param.repository,
          moduleType: 'FEATURE',
          moduleVersion: 0,
          objName,
          authority,
        } as Module)

    const logicToken = `${service}:${param.repository}Logic`
    let logic: EntityLogic<any> | undefined
    try {
      logic = await this.app.di?.injectAsync?.(logicToken)
    } catch {
      // 未注册业务 Logic 时走通用实体 Logic
    }
    if (!logic) {
      logic = await GenericEntityLogic.resolve(
        this.app.di,
        logicToken,
        param.ctor ?? defineEntity,
        {
          metaUiService: this.app.meta,
          repository: param.repository,
          metaUi,
          module,
          apiService: param.service,
        },
      )
    } else {
      logic.metaUi = metaUi
      logic.module = module
    }

    const selectionMode = param.selectionMode ?? 'multiple'
    const selectCtx = this.createChild(
      [] as T[],
      metaUi,
      `${this.cachePath}/@select/${param.repository}`,
      selectionMode === 'single'
        ? UiViewMany.SelectOne
        : UiViewMany.SelectMany,
      {},
      logic,
    ) as unknown as AbstractUiContext<T>
    if (param.searchParam) {
      EntitySearchParam.assign(selectCtx.searchParam, param.searchParam)
    }
    if (param.selectableFn) {
      selectCtx.setSelectableFn('select', param.selectableFn)
    }
    selectCtx.selectedItems = []
    await selectCtx.init()

    const showActions =
      authority.allowCreate || authority.allowEdit || authority.allowDelete
    const showActionColumn =
      authority.allowRead || authority.allowEdit || authority.allowDelete
    let picked: T[] = []
    const listProps = {
      selectionMode,
      showToolbar: true,
      showSearchbar: true,
      showBreadcrumb: false,
      showActions,
      showActionColumn,
      loading: selectCtx.loading,
      onSelect: (selection: T[]) => {
        selectCtx.selectedItems = selection ?? []
        if (selection?.length) picked = selection
      },
      onItemDoubleClick:
        selectionMode === 'single'
          ? (item: T) => {
              picked = item != null ? [item] : []
              selectCtx.selectedItems = picked
              void this.uiBuilder?.overlay?.closeTopDialog?.('ok')
            }
          : undefined,
    }

    this.root.showDialog = true
    try {
      const entityLabel = metaUi.displayLabel ?? param.repository
      const title = selectCtx.t(
        selectionMode === 'single'
          ? 'view.selectOneEntity'
          : 'view.selectManyEntity',
        { entity: entityLabel },
      )
      const result = await this.uiBuilder.selectDialog(selectCtx.asEntityUiCtx(), {
        dlgProps: {
          title,
          width: '80vw',
          height: '80vh',
          maxHeight: '90vh',
        },
        viewProps: listProps,
      })
      if (result !== 'ok') return false
      if (!picked.length && selectCtx.selectedItems?.length) {
        picked = selectCtx.selectedItems as T[]
      }
      return picked
    } finally {
      this.root.showDialog = false
    }
  }

  /**
   * 字段选择半边（框架无关）：选一个关联实体并写回字段。
   * `select` 识别到字段参数后委托到这里；仓库选择见同类的 `select(param)` 实现。
   */
  protected async selectByField(
    field: MetaUiField | string,
  ): Promise<Entity | false> {
    const fld = this.resolveField(field)
    const ref = fld.reference
    if (!ref?.refRepository || !this.app) {
      void this.uiBuilder?.toast?.(this.asEntityUiCtx(), {
        severity: 'error',
        title: this.t('dialog.title.error'),
        message: this.t('invalid.fieldNoRef', { field: fld.fieldName }),
        life: 3000,
      })
      return false
    }
    const options = this.getFieldSearchOptions(fld)
    try {
      const picked = await this.select({
        repository: ref.refRepository,
        service: ref.service,
        searchParam: options.searchParam,
        selectionMode: 'single',
      })
      if (!Array.isArray(picked) || !picked[0]) return false
      this.setFieldValue(fld, picked[0])
      options.currentSelectOption = picked[0]
      if (
        !options.selectOptions.some(
          (item: unknown) => ref.valueOf(item) === ref.valueOf(picked[0]),
        )
      ) {
        options.selectOptions.unshift(picked[0])
      }
      return picked[0]
    } catch (error) {
      console.error(error)
      void this.uiBuilder?.toast?.(this.asEntityUiCtx(), {
        severity: 'error',
        title: this.t('dialog.title.error'),
        message: error instanceof Error ? error.message : String(error),
        life: 3000,
      })
      return false
    }
  }
  async searchRelative(
    field: MetaUiField,
    searchWord = '',
    model?: M,
  ): Promise<FieldSearchOptions> {
    const row = model ?? (Array.isArray(this.model) ? undefined : this.model)
    const options = this.getFieldSearchOptions(field)
    if (options.searching) return options
    options.searching = true
    options.searchParam.searchWord = searchWord
    try {
      if (field.reference?.isEnum) {
        options.selectOptions = field.reference.refOptions ?? []
        return options
      }
      const ref = field.reference
      if (!ref || !this.logic || !ref.refRepository) return options
      const where = (this.getFieldLogic(field) ?? new MetaUiFieldLogic(field))?.buildRefWhere?.(row as Entity, this.asEntityUiCtx())
      const queryParams = { ...(options.searchParam.queryParams ?? {}) }
      if (where) queryParams.filter = where as string
      else delete queryParams.filter
      options.searchParam.queryParams = queryParams
      const page = await this.logic.searchRelative(options.searchParam, {
        repository: ref.refRepository,
        service: ref.service,
      })
      options.selectOptions = page?.list ?? []
      if (page?.pagination) options.pagination = page.pagination
      return options
    } finally {
      options.searching = false
    }
  }
  /**
   * 首页加载关联选项：enum / 已缓存直接返回；ref 与 hasOne 同一套。
   * 搜索页不走这里。框架无关：只用 logic + fieldOptions 缓存。
   */
  async loadReferenceOptions(field: MetaUiField): Promise<any[]> {
    const ref = field.reference
    if (!ref) return []
    if (ref.isEnum) return ref.refOptions
    if (ref.refOptions.length > 0) {
      const cached = this.getFieldSearchOptions(field)
      cached.selectOptions = ref.refOptions
      cached.refOptionsComplete = ref.refOptionsComplete
      return ref.refOptions
    }
    if (!(ref.isRef || ref.hasOne) || !this.logic || !ref.refRepository) {
      return ref.refOptions
    }
    const cacheKey = `${ref.service ?? ""}:${ref.refRepository}:${field.fieldName}`
    const pending = this._referenceOptionLoads.get(cacheKey)
    if (pending) return pending
    const request = (async () => {
      const options = this.getFieldSearchOptions(field)
      options.searchParam.pager = defaultChoicePager()
      options.searchParam.searchWord = ""
      const page = await this.logic!.searchRelative(options.searchParam, {
        repository: ref.refRepository!,
        service: ref.service,
      })
      const list = (page?.list ?? []) as Array<Record<string, any>>
      ref.refOptions.splice(0, ref.refOptions.length, ...list)
      const complete = pagedListIsComplete({
        list,
        pagination: page?.pagination ?? defaultChoicePager(),
      })
      ref.refOptionsComplete = complete
      options.refOptionsComplete = complete
      options.selectOptions = ref.refOptions
      if (page?.pagination) options.pagination = page.pagination
      return ref.refOptions
    })()
    this._referenceOptionLoads.set(cacheKey, request)
    try {
      return await request
    } finally {
      this._referenceOptionLoads.delete(cacheKey)
    }
  }
  getSelectedGroupItems(group: MetaUiGroup | string) {
    return this.subGroupContext(group).selectedItems
  }

  subGroupContext<G extends Entity = Entity>(
    group: MetaUiGroup | string,
  ): UiContext<G> {
    const grp = this.resolveGroup(group)
    if (!grp.groupUi) {
      throw new Error(`Group "${grp.groupName}" has no groupUi.`)
    }
    const path = `${this.cachePath}/${grp.groupName}`
    const cached = this.cache.get(path)
    if (cached) return cached as unknown as UiContext<G>
    const rows =
      ((this.model as Entity)[grp.groupName] as
        | object[]
        | undefined) ?? []
    const fieldLogics: Record<string, MetaUiFieldLogic> = {}
    const groupLogic = this.getGroupLogic(grp)
    for (const fieldLogic of groupLogic?.fields ?? []) {
      fieldLogics[fieldLogic.field.fieldName] = fieldLogic
    }
    return this.createChild(
      rows as G[],
      grp.groupUi,
      path,
      this.editing ? UiViewOne.Edit : UiViewOne.Details,
      fieldLogics,
    ) as unknown as UiContext<G>
  }

  subGroupItemContext<G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
    groupMode: UiSubGroupView = this.editing ? 'edit' : 'details',
    cacheKey = 'id',
  ): UiContext<G> {
    const grp = this.resolveGroup(group)
    if (!grp.groupUi) {
      throw new Error(`Group "${grp.groupName}" has no groupUi.`)
    }
    const rowKey = this.rowCacheKey(item, cacheKey, grp.groupUi.primaryKey)
    const path = `${this.cachePath}/${grp.groupName}/${rowKey}`
    const cached = this.cache.get(path)
    if (cached) return cached as unknown as UiContext<G>
    const fieldLogics: Record<string, MetaUiFieldLogic> = {}
    const groupLogic = this.getGroupLogic(grp)
    for (const fieldLogic of groupLogic?.fields ?? []) {
      fieldLogics[fieldLogic.field.fieldName] = fieldLogic
    }
    return this.createChild(
      item,
      grp.groupUi,
      path,
      groupMode as UiViewType,
      fieldLogics,
      (this.logic?.createRelativeLogic?.(grp.groupName, this.model as M) ??
        this.logic) as EntityLogic<G> | undefined,
    ) as unknown as UiContext<G>
  }

  /**
   * 子表行集合变化后的统一出口：先业务回调 `onChange`，再算合计 `customAggregator`。
   * 合计只算不渲染 —— 它在 `onChange` 之后跑，可以改主表的合计字段。
   */
  protected notifySubGroupChanged<G extends Entity>(
    group: MetaUiGroup,
    items: G[],
  ): void {
    const logic = this.getGroupLogic(group)
    logic?.onChangeFn?.(this.asEntityUiCtx(), this.model, items)
    logic?.customAggregator?.(this.asEntityUiCtx(), this.model, items)
  }

  addSubGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void {
    const grp = this.resolveGroup(group)
    const items = ((this.model as Entity)[grp.groupName] ??= [])
    if (items.includes(item)) return
    items.push(item)
    MetaModel.modify(this.model as Entity)
    this.notifySubGroupChanged(grp, items)
  }

  addSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): void {
    MetaModel.addSubGroupItems(this.resolveSubGroupTransform(param))
    MetaModel.modify(this.model as Entity)
    const group = this.resolveGroup(param.group)
    this.notifySubGroupChanged(group, (this.model as Entity)[group.groupName])
  }

  /**
   * **只造行，不追加**（`MetaModel.createSubGroupItems` 的 `addToTarget` 默认 `false`）：
   * 不改子表数据，因此不触发 `onChange` / `customAggregator`。
   * 追加走 `addSubGroupItem` / `addSubGroupItems` —— 那两处会重算合计。
   */
  createSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<G | G[]> {
    return Promise.resolve(
      MetaModel.createSubGroupItems(this.resolveSubGroupTransform(param)),
    )
  }

  removeSubGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
  ): void {
    const grp = this.resolveGroup(group)
    const logic = this.getGroupLogic(grp)
    const items = (this.model as Entity)[grp.groupName] ?? []
    const commit = () => {
      MetaModel.deleteItem(items, item)
      this.notifySubGroupChanged(grp, items)
    }
    const intercept = logic?.beforeItemRemoveFunc
    if (!intercept) {
      commit()
      return
    }
    const master = ((this.root ?? this).model ?? {}) as Entity
    const result = intercept(item, master, this.asEntityUiCtx())
    if (isPromise(result)) {
      result.then((ok) => {
        if (ok !== false) commit()
      })
      return
    }
    if (result !== false) commit()
  }

  removeSubGroupItems<G extends Entity>(
    group: string | MetaUiGroup,
  ): void {
    const grp = this.resolveGroup(group)
    const items = (this.model as Entity)[grp.groupName] ?? []
    MetaModel.clearItems(items)
    this.notifySubGroupChanged(grp, items)
  }

  async subGroupItem<G extends Entity>(
    group: string | MetaUiGroup,
    item: G,
    props: { groupMode?: UiSubGroupView } = {},
  ): Promise<false | G> {
    const grp = this.resolveGroup(group)
    const ctx = this.subGroupItemContext(grp, item, props.groupMode)
    if (!this.app) return item
    this.root.showDialog = true
    try {
      // Sub-table row: in-memory only, no onAccept (no save).
      const result = await this.uiBuilder.editDialog(
        ctx as unknown as UiContext,
        {
          dlgProps: {},
        },
      )
      return result === 'ok' ? (ctx.model as G) : false
    } finally {
      this.root.showDialog = false
    }
  }

  async newSubGroupItem<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<false | G> {
    const created = (await this.createSubGroupItems(param)) as G
    this.addSubGroupItem(param.group, created)
    const accepted = await this.subGroupItem(param.group, created, {
      groupMode: 'create',
    })
    if (!accepted) {
      this.removeSubGroupItem(param.group, created)
      return false
    }
    return accepted
  }

  routeToRelative(
    field: MetaUiField | string,
    item?: Record<string, any>,
  ): string | null {
    const fld = typeof field === 'string' ? this.metaUi.getField(field) : field
    if (!fld?.reference) return null
    const model = item ?? this.model
    let relativeId = (model as Record<string, any>)[fld.fieldName]
    if (
      (relativeId == null || relativeId === '') &&
      fld.reference.hasOne &&
      fld.reference.alias
    ) {
      const related = (model as Record<string, any>)[fld.reference.alias]
      if (related) relativeId = fld.reference.valueFn(related)
    }
    if (relativeId != null && typeof relativeId === 'object') {
      relativeId = fld.reference.valueFn(relativeId)
    }
    if (relativeId == null || relativeId === '') return null
    const repository = fld.reference.refRepository
    if (!repository) return null
    const service =
      this.logic?.serviceName ??
      this.logic?.apiService ??
      this.app?.api?.config?.service
    if (!service) return null
    // 跨服务引用：拼目标服务的绝对地址
    const refDbName = fld.reference.refDbName
    const baseUrl = this.app?.api?.http?.baseUrl
    if (refDbName && refDbName !== service && baseUrl) {
      return `${String(baseUrl).replace('api', '')}${refDbName.toLocaleUpperCase()}/${repository}/${relativeId}`
    }
    const path = `/${service.toUpperCase()}/${repository}/${encodeURIComponent(String(relativeId))}`
    return this.router?.resolve(path) ?? path
  }

  protected routePath(view: UiViewType, id?: string): string {
    const service = (this.logic?.serviceName ?? 'base').toUpperCase()
    const repository = this.logic?.repository ?? ''
    const root = `/${service}/${repository}`
    if (view === UiViewMany.Index) return root
    if (view === UiViewMany.SelectMany) return `${root}?view=selectMany`
    if (view === UiViewOne.Create) return `${root}/Create`
    if (view === UiViewOne.Edit) return `${root}/Edit/${id}`
    if (view === UiViewOne.Search) return `${root}/Search`
    return `${root}/${id}`
  }

  /** 当前路由路径。vui / rui 实现侧覆写；core 的 `routeToIndex` 用它剥末段。 */
  protected currentRoutePath(): string | undefined {
    return undefined
  }

  private indexOfListRow(row: Entity): number {
    const list = (this.model as { list?: Entity[] } | undefined)?.list
    if (!Array.isArray(list)) return -1
    const idx = list.indexOf(row)
    if (idx >= 0) return idx
    const key = this.metaUi?.primaryKey ?? 'id'
    const id = String((row as Record<string, unknown>)[key] ?? row.id ?? '')
    if (!id) return -1
    return list.findIndex(
      (item) =>
        String((item as Record<string, unknown>)[key] ?? item.id) === id,
    )
  }

  routeToIndex(): void {
    const path = this.currentRoutePath()
    if (path) {
      const parts = path.split('/').filter(Boolean)
      // /MES/Materials/xxx 或 /MES/Materials/Edit/xxx → /MES/Materials
      if (parts.length >= 3) {
        const listPath = `/${parts[0]}/${parts[1]}`
        if (listPath !== path) {
          this.navigate(listPath)
          return
        }
      }
    }
    this.navigate(this.routePath(UiViewMany.Index))
  }

  routeToDetails(idOrItem?: string | M): void {
    if (this.isInDialog) {
      const item =
        idOrItem != null && typeof idOrItem === 'object'
          ? (idOrItem as Entity)
          : undefined
      void this.uiBuilder?.openNestEntityDialog(
        this.asEntityUiCtx(),
        'details',
        item,
      )
      return
    }
    if (idOrItem != null && typeof idOrItem === 'object') {
      const entity = idOrItem as Entity
      const key = this.metaUi.primaryKey ?? 'id'
      const id = entity.id ?? (entity as Record<string, unknown>)[key]
      if (this.many) {
        this.currentItem = entity as M
        this.currentIndex = this.indexOfListRow(entity)
        this.moduleContext?.setCurrent(entity, this.currentIndex)
      }
      this.navigate(this.routePath(UiViewOne.Details, String(id ?? '')))
      return
    }
    const id = idOrItem ?? (this.model as Entity).id
    this.navigate(this.routePath(UiViewOne.Details, id))
  }

  routeToEdit(idOrItem?: string | M): void {
    if (this.isInDialog) {
      const item =
        idOrItem != null && typeof idOrItem === 'object'
          ? (idOrItem as Entity)
          : undefined
      void this.uiBuilder?.openNestEntityDialog(
        this.asEntityUiCtx(),
        'edit',
        item,
      )
      return
    }
    if (idOrItem != null && typeof idOrItem === 'object') {
      const entity = idOrItem as Entity
      const key = this.metaUi.primaryKey ?? 'id'
      const id = entity.id ?? (entity as Record<string, unknown>)[key]
      if (this.many) {
        this.currentItem = entity as M
        this.currentIndex = this.indexOfListRow(entity)
        this.moduleContext?.setCurrent(entity, this.currentIndex)
      }
      this.navigate(this.routePath(UiViewOne.Edit, String(id ?? '')))
      return
    }
    this.navigate(
      this.routePath(
        UiViewOne.Edit,
        idOrItem ?? (this.model as Entity).id,
      ),
    )
  }

  routeToCreate(): void {
    if (this.isInDialog) {
      void this.uiBuilder?.openNestEntityDialog(this.asEntityUiCtx(), 'create')
      return
    }
    if (this.many) {
      this.currentItem = null
      this.currentIndex = -1
      this.moduleContext?.beginCreate()
    }
    this.navigate(this.routePath(UiViewOne.Create))
  }

  routeToSearch(): void {
    this.navigate(this.routePath(UiViewOne.Search))
  }

  selectMany(
    selectableKey: string,
    handleFn: (...args: unknown[]) => unknown,
  ): void {
    this.setSelectableKey(selectableKey)
    this.setCustomManyActionHandleFn(selectableKey, handleFn)
    this.navigate(this.routePath(UiViewMany.SelectMany))
  }

  async confirmAction(): Promise<unknown> {
    if (
      this.view === UiViewMany.SelectMany ||
      this.view === UiViewMany.EditMany ||
      this.selectionMode === 'multiple'
    ) {
      if (!this.selectedItems.length) {
        await this.uiBuilder?.toast?.(this.asEntityUiCtx(), {
          severity: 'error',
          message: this.t('invalid.requiredSelectAny'),
        })
        return false
      }
      const result = await this.runCustomManyAction()
      if (result === false) return false
      this.cancel()
      await this.search()
      return result
    }
    const result = await this.save()
    if (result !== false) this.cancel()
    return result
  }

  cancel(): void {
    if (
      this.view === UiViewMany.SelectMany ||
      this.view === UiViewMany.EditMany
    ) {
      this.selectedItems = []
      this.selectionMode = null
      this.routeToIndex()
      return
    }
    if (this.view === UiViewOne.Details) {
      try {
        const model = this.model as Record<string, unknown> | undefined
        if (model) this.moduleContext?.applyCurrentRow(model)
      } catch {
        // 写回失败仍回列表，避免「返回」无响应
      }
      this.routeToIndex()
      return
    }
    this.routeToIndex()
  }
}

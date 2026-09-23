import {
  AbstractUiContext,
  UiViewMany,
  type UiViewType,
  isPagedList,
  type Entity,
  type EntityAction,
  type EntityLogic,
  type MetaUi,
  type MetaUiFieldLogic,
  type MetaUiGroupLogic,
  type MetaUiGroup,
  type PagedList,
  type UiBuilder,
  type UiContext,
  type MetaUiField,
  type FieldSearchOptions,
  type Ref,
  type Validation,
} from '@mmda/core'
import {
  GenericEntityLogic,
  defineEntity,
  EntitySearchParam,
} from '@mmda/core'
import type { EntitySelectParam } from '@mmda/core'
import type { ReactNavigator } from './mixins/navigate'
import { proxy } from 'valtio'
import { createReactRxFactory } from '../reactivity'
import type { MmdaReactApp } from '../app/app'

export interface RuiContextOptions<M extends Entity = Entity> {
  model: M | M[]
  metaUi: MetaUi
  locale?: string
  loader?: () => Promise<M | M[]>
  fieldLogics?: Record<string, MetaUiFieldLogic<any>>
  groupLogics?: Record<string, MetaUiGroupLogic<any, any>>
  logic: EntityLogic<M> | undefined
  /** react-router 的 navigate 函数，注入后 routeTo* 可用。 */
  navigate?: ReactNavigator
  /**
   * 应用壳：`context.app` / `context.uiBuilder` 从它取（对照 vui 的 `VuiContextOptions.app`）。
   * 宿主 `MmdaReactApp.createContext` 自己注入，业务不要传。
   */
  app?: MmdaReactApp
}

/** ReactUiContext 中可响应式观察的核心状态。 */
export interface RuiState<M extends Entity = Entity> {
  model: M | M[] | undefined
  loading: Ref<boolean>
  error: Ref<unknown>
  initializedState: Ref<boolean>
  validationState: Validation
  fieldOptions: Record<string, FieldSearchOptions>
  selectedItems: M[]
  currentItem: M | null
  selectionMode: 'single' | 'multiple' | null
  currentIndex: number
}

export class ReactUiContext<M extends Entity = Entity> extends AbstractUiContext<M> {

  // —— 响应式 ———

  readonly _state: RuiState<M>

  // —— state ———

  get model(): M | M[] { return this._state.model as M | M[] }
  set model(v: M | M[]) { this._state.model = v }
  override metaUi!: MetaUi
  override locale!: string
  override loader?: () => Promise<M | M[]>
  override fieldLogics!: Record<string, any>
  override groupLogics!: Record<string, any>
  override logic!: EntityLogic<M> | undefined
  override actionLoadings: Record<string, boolean> = {}
  override cache = new Map<string, any>() as any
  override customActions: EntityAction[] = []
  override executing = false
  override isInDialog = false

  private _navigate?: ReactNavigator
  /** 应用壳（宿主注入）：`app` / `uiBuilder` 由它派生。 */
  private _app?: MmdaReactApp

  constructor(
    options: RuiContextOptions<M>,
    child?: {
      parent: ReactUiContext<Entity>
      cache: Map<string, AbstractUiContext<Entity>>
      cachePath: string
      validation?: any
    },
  ) {
    super()
    this.rxFactory = createReactRxFactory()
    this.metaUi = options.metaUi
    this.locale = options.locale ?? options.metaUi.locale ?? 'zh'
    this.loader = options.loader
    this.logic = options.logic as EntityLogic<M> | undefined
    this.fieldLogics = options.fieldLogics ?? {}
    this.groupLogics = options.groupLogics ?? {}
    this.parent = child?.parent as any
    if (child?.cache) this.cache = child.cache as any
    this.cachePath = child?.cachePath ?? '@root'
    this._state = proxy<RuiState<M>>({
      model: undefined,
      loading: this.loading,
      error: this.error,
      initializedState: this.initializedState,
      validationState: {} as Validation,
      fieldOptions: {},
      selectedItems: [],
      currentItem: null,
      selectionMode: null,
      currentIndex: -1,
    })
    this.model = this.initModel(options.model, false)
    this.validationState = this.initValidation(child?.validation)
    this._navigate = options.navigate
    this._app = options.app
    this.router = options.navigate
      ? { push: options.navigate, resolve: (path: string) => path }
      : undefined
    this.cache.set(this.cachePath, this as any)
  }

  override get fieldOptions(): Record<string, FieldSearchOptions> { return this._state.fieldOptions }
  override get validationState(): Validation { return this._state.validationState }
  override set validationState(v: Validation) { this._state.validationState = v }
  get selectedItems(): M[] { return this._state.selectedItems }
  set selectedItems(v: M[]) { this._state.selectedItems = v }
  get currentItem(): M | null { return this._state.currentItem }
  set currentItem(v: M | null) { this._state.currentItem = v }
  get selectionMode(): 'single' | 'multiple' | null { return this._state.selectionMode }
  set selectionMode(v) { this._state.selectionMode = v }
  get currentIndex(): number { return this._state.currentIndex }
  set currentIndex(v: number) { this._state.currentIndex = v }

  /** 应用壳。缺省 undefined —— 单测可以直接 new 一个不带壳的会话。 */
  get app(): MmdaReactApp | undefined { return this._app }
  set app(v: MmdaReactApp | undefined) { this._app = v }
  /** 数据访问器，来自 Logic。 */
  get apiClient() { return this.logic?.apiClient }
  /** 拼屏入口：`context.uiBuilder.buildEditView(context)` 这类调用全靠它。 */
  get uiBuilder(): UiBuilder | undefined { return this._app?.ui }

  override setModel(model: M | M[]): void {
    if (Array.isArray(this.model)) {
      (this.model as M[]).splice(0)
      const rows = isPagedList(model) ? (model as unknown as PagedList<M>).list ?? [] : Array.isArray(model) ? model : [model]
      ;(this.model as M[]).push(...rows)
    } else {
      Object.assign(this.model as Record<string, any>, model)
    }
  }

  /** 创建子 context（不要求 model 是 Entity）。subGroup 等内部使用。 */
  private _createChildRaw<G extends Entity>(
    model: any,
    metaUi: MetaUi,
    cachePath: string,
    _view?: UiViewType,
    fieldLogics?: Record<string, any>,
    logic?: EntityLogic<G>,
  ): ReactUiContext<G> {
    return new ReactUiContext<G>({
      model, metaUi, locale: this.locale,
      fieldLogics: (fieldLogics ?? this.fieldLogics) as any,
      groupLogics: this.root.groupLogics as any,
      logic: (logic ?? this.logic) as any,
      navigate: this._navigate,
      app: this._app,
    }, { parent: this as any, cache: this.cache as any, cachePath })
  }

  override createChild<G extends Entity>(
    model: G | G[],
    metaUi: MetaUi,
    cachePath: string,
    view?: UiViewType,
    fieldLogics?: Record<string, any>,
    logic?: EntityLogic<G>,
  ): ReactUiContext<G> {
    return this._createChildRaw(model, metaUi, cachePath, view, fieldLogics, logic)
  }

  // —— 路由 ———————————————————————————————

  // routeToIndex / routeToDetails / routeToEdit / routeToCreate / routeToSearch
  // 由 AbstractUiContext.routePath + navigate 统一实现。

  select(field: MetaUiField | string): Promise<Entity | false>
  select<T extends Entity>(param: EntitySelectParam<T>): Promise<boolean | T[]>
  async select<T extends Entity>(fieldOrParam: MetaUiField | string | EntitySelectParam<T>): Promise<Entity | false | boolean | T[]> {
    // 1. 字段选择
    if (this.isFieldSelect(fieldOrParam)) {
      return this.selectByField(fieldOrParam)
    }

    // 2. 仓库选择
    const param = fieldOrParam as EntitySelectParam<T>
    if (!this.app || !this.uiBuilder) return false
    const repo = param.repository
    const service = param.service ?? (this.app as any).name ?? "base"
    const metaUi = await (this.app as any).meta?.get(repo, param.service) ?? this.metaUi
    const logic = await GenericEntityLogic.resolve((this.app as any).di, service + ":" + repo + "Logic", param.ctor ?? defineEntity, {
      metaUiService: (this.app as any).meta,
      repository: repo,
      metaUi,
      module: { objName: metaUi.objName, moduleLabel: metaUi.displayLabel ?? repo } as any,
      apiService: param.service,
    })
    logic.metaUi = metaUi

    const selectionMode = param.selectionMode ?? "multiple"
    const selectCtx = new ReactUiContext<T>({
      model: [] as T[],
      metaUi,
      logic: logic as any,
      navigate: this._navigate,
    })
    selectCtx.searchParam ??= EntitySearchParam.create()
    if (param.searchParam) EntitySearchParam.assign(selectCtx.searchParam, param.searchParam)
    selectCtx.selectedItems = []

    let picked: T[] = []
    const result = await this.uiBuilder.selectDialog(selectCtx as any, {
      dlgProps: { name: "select", title: metaUi.displayLabel ?? repo, width: "80vw", height: "80vh", maxHeight: "90vh" } as any,
      viewProps: {
        selectionMode,
        showToolbar: true,
        showSearchbar: true,
        showBreadcrumb: false,
        loading: selectCtx.loading,
        onSelect: (selection: T[]) => { selectCtx.selectedItems = selection ?? []; if (selection?.length) picked = selection },
      } as any,
    })
    if (result !== "ok") return false
    if (!picked.length && selectCtx.selectedItems?.length) picked = selectCtx.selectedItems as T[]
    return picked
  }

  selectMany(selectableKey: string, handleFn: (...args: unknown[]) => unknown): void {
    // selectableKey / handleFn 的会话态仍在壳层；路径走基类。
    this.navigate(this.routePath(UiViewMany.SelectMany))
  }
  async search(): Promise<unknown> {
    if (!this.logic) return
    this._setLoading(true)
    try {
      const page = await this.logic.getAll(this.searchParam)
      if (page) this.setModel(page as any)
      return page
    } catch (e) {
      this.error.value = e
      throw e
    } finally {
      this._setLoading(false)
    }
  }

  async reload(): Promise<unknown> {
    return this.search()
  }

}

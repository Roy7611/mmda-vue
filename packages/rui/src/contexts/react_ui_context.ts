import {
  AbstractUiContext,
  UiViewMany,
  UiViewOne,
  type UiViewType,
  isPagedList,
  type Entity,
  type EntityAction,
  type EntityLogic,
  type ApiClient,
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
  /** 当前视图（details / edit / create / 列表）。缺省 details。 */
  view?: UiViewType
  /** react-router 的 navigate 函数，注入后 routeTo* 可用。 */
  navigate?: ReactNavigator
  /**
   * 应用壳：`context.app` / `context.uiBuilder` 从它取（对照 vui 的 `VuiContextOptions.app`）。
   * 宿主 `MmdaReactApp.createContext` 自己注入，业务不要传。
   */
  app?: MmdaReactApp
}

/** RuiContext 中可响应式观察的核心状态。 */
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

export class RuiContext<M extends Entity = Entity> extends AbstractUiContext<M> {

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

  private _view?: UiViewType

  private _navigate?: ReactNavigator
  /** 应用壳（宿主注入）：`app` / `uiBuilder` 由它派生。 */
  private _app?: MmdaReactApp

  constructor(
    options: RuiContextOptions<M>,
    child?: {
      parent: RuiContext<Entity>
      cache: Map<string, AbstractUiContext<Entity>>
      cachePath: string
      validation?: any
    },
  ) {
    super()
    this.rxFactory = createReactRxFactory()
    this.metaUi = options.metaUi
    this.locale = options.locale ?? options.metaUi.locale ?? 'zh'
    this._view = options.view
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
      ? {
          push: options.navigate,
          resolve: (path: string) => path,
          parse: (path: string) => path,
          back: () => {
            if (typeof window !== 'undefined') window.history.back()
          },
        }
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
  protected get selectionModeStorage(): 'single' | 'multiple' | null {
    return this._state.selectionMode
  }
  protected set selectionModeStorage(v: 'single' | 'multiple' | null) {
    this._state.selectionMode = v
  }
  get currentIndex(): number { return this._state.currentIndex }
  set currentIndex(v: number) { this._state.currentIndex = v }

  get view(): UiViewType { return this._view ?? UiViewOne.Details }
  override get editing(): boolean {
    return this.view === UiViewOne.Edit || this.view === UiViewOne.Create
  }

  /** 应用壳。缺省 undefined —— 单测可以直接 new 一个不带壳的会话。 */
  get app(): MmdaReactApp { return this._app as MmdaReactApp }
  set app(v: MmdaReactApp | undefined) { this._app = v }
  /** 数据访问器，来自 Logic。 */
  get apiClient(): ApiClient { return this.logic?.apiClient as ApiClient }
  /** 拼屏入口：`context.uiBuilder.buildEditView(context)` 这类调用全靠它。 */
  get uiBuilder(): UiBuilder { return this._app?.ui as UiBuilder }

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
    view?: UiViewType,
    fieldLogics?: Record<string, any>,
    logic?: EntityLogic<G>,
  ): RuiContext<G> {
    return new RuiContext<G>({
      model, metaUi, locale: this.locale,
      view,
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
  ): RuiContext<G> {
    return this._createChildRaw(model, metaUi, cachePath, view, fieldLogics, logic)
  }

  // —— 路由 ———————————————————————————————

  // routeToIndex / routeToDetails / routeToEdit / routeToCreate / routeToSearch
  // 由 AbstractUiContext.routePath + navigate 统一实现。

}

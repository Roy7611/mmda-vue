import {
  AbstractUiContext,
  defaultFieldSearchOptions,
  defineValidation,
  isPagedList,
  MetaModel,
  validateFieldResult,
  type Entity,
  type EntityAction,
  type EntityLogic,
  type EntitySearchParam,
  type FieldSearchOptions,
  type FieldValidation,
  type MetaUi,
  type MetaUiField,
  type MetaUiFieldLogic,
  type MetaUiGroup,
  type MetaUiGroupLogic,
  type PagedList,
  type Pager,
  type Pagination,
  type SubGroupItemTransformParam,
  type Translatable,
  type TranslateFn,
  type UiBuilder,
  type UiContext,
  type Validation,
} from '@mmda/core'
import {
  reactive,
  ref,
  shallowReactive,
  toRaw,
  type Ref,
  type UnwrapNestedRefs,
} from 'vue'
import type { Router } from 'vue-router'

import { UiViewMany, UiViewOne, type UiViewType } from './view'
import type { MmdaVueApp } from '../app/app'
import type { UiAction } from '../ui/factory/action'
import { WithSubgroup } from './mixins/subgroup'
import { WithReference } from './mixins/reference'
import { WithData } from './mixins/data'
export { deletableSelectedItems } from './mixins/data'
import { WithNavigate } from './mixins/navigate'
import { createSession, setSessionFactory } from './mixins/session'
import type { ChildContextOptions } from './mixins/types'
import { createVueRxFactory } from '../rx'

// ——— helpers ————————————————————————————

const identityTranslate: TranslateFn = (message) =>
  typeof message === 'string' ? message : message.message

// ——— VuiContextBase ————————————————————

export interface VuiContextOptions<M extends Entity = Entity> {
  model: M | M[]
  metaUi: MetaUi
  view?: UiViewType
  locale?: string
  translate?: TranslateFn
  loader?: () => Promise<M | M[]>
  fieldLogics?: Record<string, MetaUiFieldLogic<any>>
  groupLogics?: Record<string, MetaUiGroupLogic<any, any>>
  app?: MmdaVueApp
  logic?: EntityLogic<M>
  router?: Router
}

class VuiContextBase<M extends Entity = Entity> extends AbstractUiContext<M> {

  // —— Vue 专有状态 ————————————————————

  readonly view: UiViewType

  // override base abstract fields with Vue-reactive
  override model: M | M[]
  override metaUi: MetaUi
  override locale: string
  override loader?: () => Promise<M | M[]>
  override fieldLogics: Record<string, MetaUiFieldLogic<any>>
  override groupLogics: Record<string, MetaUiGroupLogic<any, any>>
  override logic: EntityLogic<M> | undefined
  customActions: EntityAction[] = []
  executing = false
  isInDialog = false
  private _app?: MmdaVueApp

  override parent: UiContext<M> | undefined
  override cache: Map<string, AbstractUiContext<Entity>>
  override cachePath: string

  override fieldOptions: Record<string, FieldSearchOptions> = {}
  override validationState: UnwrapNestedRefs<Validation>
  override actionLoadings: Record<string, boolean> = reactive({})

  protected override translateFn: TranslateFn

  /** Vue Router 原文引用；currentRoute/back 等框架能力走这里，core 侧只用 UiRouter 适配器。 */
  vueRouter?: Router

  readonly pageNotice: Ref<any>
  private _selected: M[] = []
  private _selectionMode: 'single' | 'multiple' | null = null
  private _currentItem: M | null = null
  currentIndex = -1
  private _pendingPagination?: Pagination

  // —— 桥接（override base）—————————————

  protected override _notify(): void { /* Vue auto-tracks */ }
  protected override _rawModel(obj: object): object { return toRaw(obj) }

  // —— 构造器 ————————————————————————————

  constructor(options: VuiContextOptions<M>, child?: ChildContextOptions) {
    super()
    this.rxFactory = createVueRxFactory()

    this.view = options.view ?? UiViewOne.Details
    const editing =
      this.view === UiViewOne.Edit ||
      this.view === UiViewOne.Create ||
      this.view === UiViewMany.EditMany

    if (isPagedList(options.model)) {
      const paged = options.model as unknown as PagedList<M>
      this.model = shallowReactive([...paged.list]) as M[]
      this._pendingPagination = paged.pagination
    } else if (Array.isArray(options.model)) {
      this.model = shallowReactive([...options.model]) as M[]
    } else {
      this.model = (
        editing ? reactive(options.model) : shallowReactive(options.model)
      ) as M
    }

    this.metaUi = options.metaUi
    this.locale = options.locale ?? options.metaUi.locale ?? 'zh'

    const app = options.app ?? (child?.parent as any)?.app
    this._app = app
    this.translateFn =
      options.translate ??
      (child?.parent as any)?.translateFn ??
      (app
        ? (message: any) => {
            const value =
              typeof message === 'string' ? message : message.message
            const param =
              typeof message === 'string' ? undefined : message.param
            return String((app as any).i18n?.global.t(value, param))
          }
        : identityTranslate)

    this.loader = options.loader
    this.fieldLogics = options.fieldLogics ?? {}
    this.groupLogics = options.groupLogics ?? {}

    this.logic = (
      options.logic ?? (child?.parent as any)?.logic
    ) as EntityLogic<M> | undefined

    const vueRouter =
      options.router ?? (child?.parent as any)?.vueRouter
    this.vueRouter = vueRouter
    this.router = vueRouter
      ? {
          push: (path: string) => {
            void vueRouter.push(path)
          },
          resolve: (path: string) => vueRouter.resolve(path).href,
        }
      : undefined
    this.parent = child?.parent as any
    this.cache = (
      child?.cache as unknown as Map<string, AbstractUiContext<Entity>> | undefined
    ) ?? new Map()
    this.cachePath = child?.cachePath ?? '@root'

    this.validationState = reactive(
      child?.validation ?? defineValidation(this.metaUi, this.model as Entity),
    )

    this.pageNotice = ref(null)

    this.cache.set(this.cachePath, this as any)
  }

  override get editing() {
    return this.view === UiViewOne.Edit || this.view === UiViewOne.Create
  }

  get app(): MmdaVueApp | undefined { return this._app }
  set app(v: MmdaVueApp | undefined) { this._app = v }
  get apiClient() { return this.logic?.apiClient }
  get uiBuilder(): UiBuilder | undefined { return (this.app as any)?.ui }

  override get selectedItems(): M[] { return this._selected }
  override set selectedItems(v: M[]) { this._selected = v }
  override get currentItem(): M | null { return this._currentItem }
  override set currentItem(v: M | null) { this._currentItem = v }
  override get selectionMode(): 'single' | 'multiple' | null { return this._selectionMode }
  override set selectionMode(v) { this._selectionMode = v }

  flushPendingPagination(searchParam?: { pager?: Pager }) {
    if (!this._pendingPagination) return
    const pager = searchParam?.pager as (Pager & Pagination) | undefined
    if (pager) {
      const pp = this._pendingPagination
      pager.pageSize = pp.pageSize
      pager.pageNo = pp.pageNo
      if (pp.sorts) pager.sorts = pp.sorts
      pager.recordCount = pp.recordCount
      pager.pageCount = pp.pageCount
    }
    this._pendingPagination = undefined
  }

  override setModel(model: M | M[]): void {
    if (Array.isArray(this.model)) {
      let rows: M[] = []
      if (isPagedList(model)) {
        const paged = model as unknown as PagedList<M>
        this.flushPendingPagination(
          (this as any).searchParam as { pager?: Pager } | undefined,
        )
        rows = paged.list ?? []
      } else if (Array.isArray(model)) {
        rows = model
      }
      ;(this.model as M[]).splice(0, Infinity, ...rows)
      return
    }
    if (isPagedList(model) || Array.isArray(model)) return
    const target = this.model as Record<string, any>
    for (const key of Object.keys(target)) {
      if (!(key in (model as object))) delete target[key]
    }
    Object.assign(target, model)
  }

  override createChild<G extends Entity>(
    model: G | G[],
    metaUi: MetaUi,
    cachePath: string,
    view?: UiViewType,
    fieldLogics?: Record<string, MetaUiFieldLogic<any>>,
    logic?: EntityLogic<G>,
  ): VuiContextBase<G> {
    return createSession(
      {
        model,
        metaUi,
        view: view ?? this.view,
        locale: this.locale,
        translate: this.translateFn,
        fieldLogics: fieldLogics ?? (this.fieldLogics as any),
        groupLogics: this.root.groupLogics,
        app: this.app as any,
        logic: (logic ?? this.logic) as any,
      },
      {
        parent: this as any,
        cache: this.cache as any,
        cachePath,
      },
    ) as unknown as VuiContextBase<G>
  }
}

// ——— mixin chain —————————————————————————————

class VuiContextRuntime extends WithNavigate(
  WithData(WithReference(WithSubgroup(VuiContextBase))),
) {
  constructor(options: VuiContextOptions<any>, child?: ChildContextOptions) {
    super(options, child)
    this.flushPendingPagination((this as any).searchParam)
  }
}

export type VuiContext<M extends Entity = Entity> = VuiContextRuntime &
  UiContext<M>

export const VuiContext = VuiContextRuntime as unknown as {
  new <M extends Entity = Entity>(
    options: VuiContextOptions<M>,
    child?: ChildContextOptions,
  ): VuiContext<M>
}

setSessionFactory(
  (options: any, child: any) => new VuiContext(options, child),
)

export type { ChildContextOptions }

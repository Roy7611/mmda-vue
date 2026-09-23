/**
 * 会话基类：框架无关的字段读写、校验帮助、会话树。
 *
 * Vue（VuiContextBase）和 React（ReactUiContextBase）各自继承本类，
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
import { MetaModel, type SubGroupItemTransformParam } from '../models/metamodel'
import {
  defaultFieldSearchOptions,
  type FieldSearchOptions,
} from '../logic/field_search_options'
import { MetaUiFieldLogic } from '../logic/field_logic'
import { MetaUiGroupLogic } from '../logic/group_logic'
import type { EntityLogic } from '../logic/entity_logic'
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
import type {
  EntitySearchParam,
  EntitySelectParam,
} from '../models/entity_search'
import type {
  MetaUiField,
  Translatable,
  TranslateFn,
} from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { Module, ModuleAuth } from '../metaui/module'
import type { UiContext, UiSubGroupView } from './context'
import { UiViewMany, UiViewOne, type UiViewType } from './view'
import type { Ref, RxFactory, RxWatchSource } from './rx'
import type { UiRouter } from './router'

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

  parent: UiContext<M> | undefined
  abstract cache: Map<string, AbstractUiContext<Entity>>
  cachePath = '@root'

  // 响应式状态：rx() 惰性创建，子类构造时先注入 rxFactory。
  private _loading?: Ref<boolean>
  private _error?: Ref<unknown>
  private _initializedState?: Ref<boolean>

  get loading(): Ref<boolean> {
    return (this._loading ??= this.rx(false))
  }
  get error(): Ref<unknown> {
    return (this._error ??= this.rx<unknown>(null))
  }
  get initializedState(): Ref<boolean> {
    return (this._initializedState ??= this.rx(!this.loader))
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

  get $v(): Validation {
    return this.validationState
  }

  get root(): AbstractUiContext<Entity> {
    return (this.parent?.root ?? this) as unknown as AbstractUiContext<Entity>
  }

  get isRoot(): boolean {
    return !this.parent
  }

  get app(): any { throw new Error('Not implemented: app') }
  get apiClient(): any { throw new Error('Not implemented: apiClient') }
  get uiBuilder(): any { throw new Error('Not implemented: uiBuilder') }

  abstract selectedItems: M[]
  abstract selectionMode: 'single' | 'multiple' | null
  abstract currentItem: M | null
  abstract currentIndex: number
  searchParam: EntitySearchParam | undefined

  protected asUiCtx(): UiContext<M> {
    return this as unknown as UiContext<M>
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
  }

  setupFieldLogic(logic: MetaUiFieldLogic<any>): void {
    this.fieldLogics[logic.field.fieldName] = logic
  }

  setupGroupLogic(logic: MetaUiGroupLogic<any, any>): void {
    this.groupLogics[logic.group.groupName] = logic
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
      this.asUiCtx(),
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
        this.asUiCtx(),
      )
    )
  }

  isFieldHidden(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field)
    return (
      !!fld.hidden ||
      !!this.getFieldLogic(fld)?.hiddenFn?.(
        this.model,
        this.asUiCtx(),
      )
    )
  }

  isFieldRequired(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field)
    return (
      !fld.nullable ||
      !!this.getFieldLogic(fld)?.requiredFn?.(
        this.model,
        this.asUiCtx(),
      )
    )
  }

  isGroupReadonly(group: MetaUiGroup | string): boolean {
    const grp = this.resolveGroup(group)
    return (
      !!grp.readOnly ||
      !!this.getGroupLogic(grp)?.readonlyFn?.(
        this.model,
        this.asUiCtx(),
      )
    )
  }

  isGroupHidden(group: MetaUiGroup | string): boolean {
    const grp = this.resolveGroup(group)
    if (
      this.getGroupLogic(grp)?.hiddenFn?.(
        this.model,
        this.asUiCtx(),
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
    return fn(item, master, this.asUiCtx()) !== false
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
      this.asUiCtx(),
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
        this._rawModel((cached as any).model as object) !==
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
  abstract setModel(model: M | M[]): void

  // —— mixin 能力（stub，由 mixin 或子类覆写）————————>

  search(): Promise<unknown> {
    throw new Error('Not implemented: search')
  }
  reload(): Promise<unknown> | unknown {
    throw new Error('Not implemented: reload')
  }
  async save(): Promise<unknown> {
    if (!this.logic) return
    if (this.logic.beforeSave) {
      const ok = await this.logic.beforeSave(this.asUiCtx() as any, this.model as any)
      if (ok === false) return false
    }
    if (this.logic.beforeValidate) {
      const ok = await this.logic.beforeValidate(this.asUiCtx() as any, this.model as any)
      if (ok === false) return false
    }
    const valid = await this.validate()
    if (!valid) {
      const messages = this.collectInvalidMessages?.() ?? []
      await this.uiBuilder?.message?.(this.asUiCtx() as any, {
        severity: 'error',
        content: messages.length > 0 ? messages.join('；') : this.translate('invalid.model'),
      } as any)
      return false
    }
    const remoteErrors = await this.logic.afterValidate?.(this.asUiCtx() as any, this.model as any, this.$v)
    if (remoteErrors && remoteErrors > 0) {
      const messages = this.collectInvalidMessages?.() ?? []
      await this.uiBuilder?.message?.(this.asUiCtx() as any, {
        severity: 'error',
        content: messages.length > 0 ? messages.join('；') : this.translate('failure.beforeSave'),
      } as any)
      return false
    }
    const result = await this.logic.save(this.model as any)
    if (result && typeof result === 'object') this.setModel(result)
    await this.logic.afterSave?.(this.asUiCtx() as any, this.model as any, undefined, result)
    await this.uiBuilder?.message?.(this.asUiCtx() as any, {
      severity: 'success',
      content: this.translate('success.saved'),
    } as any)
    return result
  }

  async delete(): Promise<unknown> {
    if (!this.logic) return
    if (this.logic.beforeDelete) {
      const ok = await this.logic.beforeDelete(this.asUiCtx() as any, this.model as any)
      if (ok === false) return false
    }
    const id = (this.model as Entity).id
    const result = await this.logic.delete(id)
    await this.logic.afterDelete?.(this.asUiCtx() as any, this.model as any, undefined, result)
    return result
  }

  async refresh(reloadMetadata = false, setLoading = true): Promise<void> {
    if (!this.logic) return
    if (setLoading) this._setLoading(true)
    try {
      if (reloadMetadata) await this.logic.initMetadata(true)
      if (this.logic.beforeLoad) await this.logic.beforeLoad(this.asUiCtx() as any, this.model as any)
      const id = (this.model as Entity).id
      if (id) {
        const loaded = await this.logic.load(id)
        if (loaded) this.setModel(loaded)
      }
      await this.logic.afterLoad?.(this.asUiCtx() as any, this.model as any)
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
      const rowContext = this.subGroupItemContext(grp, row as any)
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
  select<T extends Entity = Entity>(
    fieldOrParam: MetaUiField | string | EntitySelectParam<T>,
  ): Promise<Entity | false | boolean | T[]> {
    if (this.isFieldSelect(fieldOrParam)) {
      return this.selectByField(fieldOrParam)
    }
    throw new Error('Not implemented: select')
  }

  /**
   * 字段选择半边（框架无关）：选一个关联实体并写回字段。
   * vui / rui 的 `select` 识别到字段参数后委托到这里；
   * 仓库选择半边仍由各框架自己实现。
   */
  protected async selectByField(
    field: MetaUiField | string,
  ): Promise<Entity | false> {
    const fld = this.resolveField(field)
    const ref = fld.reference
    if (!ref?.refRepository || !this.app) {
      void this.uiBuilder?.toast?.(this, {
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
      void this.uiBuilder?.toast?.(this, {
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
      const where = (this.getFieldLogic(field) ?? new MetaUiFieldLogic(field))?.buildRefWhere?.(row as Entity, this.asUiCtx())
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
    logic?.onChangeFn?.(this.asUiCtx(), this.model, items)
    logic?.customAggregator?.(this.asUiCtx(), this.model, items)
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
    const result = intercept(item, master, this.asUiCtx())
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
      const result = await this.uiBuilder.editDialog(ctx, {
        dlgProps: { name: grp.groupName },
      })
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

  routeToIndex(): void {
    this.navigate(this.routePath(UiViewMany.Index))
  }

  routeToDetails(idOrItem?: string | M): void {
    const id =
      idOrItem != null && typeof idOrItem === 'object'
        ? (idOrItem as Entity).id
        : (idOrItem ?? (this.model as Entity).id)
    this.navigate(this.routePath(UiViewOne.Details, id))
  }

  routeToEdit(id?: string): void {
    this.navigate(this.routePath(UiViewOne.Edit, id))
  }

  routeToCreate(): void {
    this.navigate(this.routePath(UiViewOne.Create))
  }

  routeToSearch(): void {
    this.navigate(this.routePath(UiViewOne.Search))
  }
  selectMany(
    _selectableKey: string,
    _handleFn: (...args: unknown[]) => unknown,
  ): void {
    throw new Error('Not implemented')
  }
}

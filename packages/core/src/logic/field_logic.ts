import type { Predicate } from '../metaui/metaui_field'
import type { UiContext } from './ui_context'
import {
  MetaUiField,
  MetaUiFieldFrozen,
  type FooterAction,
  type OnChangeFn,
  type onSearchChangeFn,
  type setSelectableFn,
  type setSearchParamFn,
  type setAggregationFn,
  type OnValidateFn,
  type OnWarnFn,
  type RefFilterFn,
} from '../metaui/metaui_field'

const logicOr =
  <T>(a: Predicate<T>, b: Predicate<T>): Predicate<T> =>
    value => a(value) || b(value)

/**
 * 元域渲染函数，不同的环境，其实现机制不一样。
 * @remarks 例如 Vue，返回渲染结果，通常是 `VNode`。
 */
export type UiFieldRenderer = (
  fld: MetaUiField,
  ctx: UiContext<any>,
  props: Record<string, any>,
) => any;

export type UiCellRenderer<T extends object = Record<string, any>> = (
  fld: MetaUiField,
  ctx: UiContext<any>,
  props: Record<string, any>,
) => any;

/**
 * 元域逻辑，包括只读、隐藏、修改值监视以及设置自定义渲染和编辑器函数。
 *
 * @typeParam E 实体类型，例如 `BOM`
 * @remarks 注意这些逻辑函数是非响应式的原生 js 函数。
 */
export class MetaUiFieldLogic<E> {
  logicMethods: Record<string, Function>
  /** 是否可搜索（列表页搜索栏） */
  isSearchField?: boolean
  /** 是否直接单元格内编辑 */
  cellEditable?: boolean
  /** 自定义编辑器 */
  customEditor?: Function
  /** 自定义渲染器 */
  customRenderer?: Function
  /** 自定义表格单元格渲染器 */
  customCellRenderer?: Function
  /** 是否冻结列（None/Left/Right） */
  frozen?: MetaUiFieldFrozen
  /** 只读条件函数 */
  readonlyFn?: Predicate
  /** 隐藏条件函数 */
  hiddenFn?: Predicate
  /** 必填条件函数 */
  requiredFn?: Predicate
  /** 自定义校验函数 */
  onValidateFn?: OnValidateFn
  /** 自定义警告函数 */
  onWarnFn?: OnWarnFn
  /** 值变更回调函数 */
  onChangeFn?: OnChangeFn
  /** 搜索条件变更回调函数 */
  onSearchChangeFn?: onSearchChangeFn
  /** 可勾选条件设置函数 */
  selectableFn?: setSelectableFn
  /** 搜索参数设置函数 */
  setSearchParamFn?: setSearchParamFn
  /** 聚合函数 */
  setAggregationFn?: setAggregationFn
  /** 冻结列设置函数 */
  setFrozenFn?: (val: MetaUiFieldFrozen) => void
  /** 搜索弹窗底部操作按钮（仅关联字段生效） */
  footerActions?: FooterAction[]
  /** 关联过滤器（logic 层缓存，优先于 reference.filterFn） */
  filterFn?: RefFilterFn

  constructor(public readonly field: MetaUiField) {
    this.logicMethods = {}
    this.hasField()
  }

  private hasField() {
    if (!this.field) {
      console.warn(`${this?.field?.fieldName || ''} field invalid.`)
    }
    return this
  }

  /**
   * 根据条件 predicate 设置当前字段为只读，返回 this 以便链式调用。
   * @example this.fieldLogic.lockIf(item => item.age > 18)
   */
  lockIf(predicate: Predicate<E>) {
    this.readonlyFn = predicate
    return this
  }

  /** 将当前字段设置为只读，等效于 `lockIf(() => true)` */
  lock() {
    return this.lockIf(() => true)
  }

  /**
   * 根据条件 predicate 隐藏当前字段，返回 this 以便链式调用。
   * @example this.fieldLogic.hideIf(item => item.age > 18)
   */
  hideIf(predicate: Predicate<E>) {
    this.hiddenFn = predicate
    return this
  }

  /** 隐藏当前字段，等效于 `hideIf(() => true)` */
  hide() {
    return this.hideIf(() => true)
  }

  /**
   * 根据条件 predicate 设置当前字段为必填，返回 this 以便链式调用。
   * @example this.fieldLogic.requiredIf(item => item.age > 18)
   */
  requiredIf(predicate: Predicate<E>) {
    if (this.requiredFn && this.requiredFn != predicate)
      this.requiredFn = logicOr(predicate, this.requiredFn)
    else this.requiredFn = predicate
    return this
  }

  /** 等效于 `requiredIf(() => true)`，设置当前字段为必填 */
  required() {
    return this.requiredIf(() => true)
  }

  /** 设置为表格单元格可直接编辑 */
  inPlaceEdit() {
    this.cellEditable = true
    return this
  }

  /**
   * 设置为搜索条件；若元数据 `hidden` 为 true 则不可搜索。
   */
  searchable(value: boolean) {
    this.isSearchField = this.field.hidden ? false : value
    return this
  }

  onValidate<V = any>(validate: OnValidateFn<V, E>) {
    this.onValidateFn = validate
    return this
  }

  onWarn<V = any>(warn: OnWarnFn<V, E>) {
    this.onWarnFn = warn
    return this
  }

  /** 域值改变时触发（beforeEdit 中编辑时使用） */
  onChange<P = any>(change: OnChangeFn<E, P>) {
    this.onChangeFn = change
    return this
  }

  /** 搜索域 value 改变时触发（beforeIndex 中 searchable=true 时使用） */
  onSearchChange<P = any>(searchChangeFn: onSearchChangeFn<P>) {
    this.onSearchChangeFn = searchChangeFn
    return this
  }

  setSelectable(selectableFn: setSelectableFn) {
    this.selectableFn = selectableFn
    return this
  }

  setSearchParam<P = any>(setSearchParamFn: setSearchParamFn<P>) {
    this.setSearchParamFn = setSearchParamFn
    return this
  }

  setAggregation<P = any>(setAggregationFn: setAggregationFn<P>) {
    this.setAggregationFn = setAggregationFn
    return this
  }

  /**
   * 设置搜索弹窗 Footer 操作按钮。
   * 仅对关联字段（reference.isRef 或 reference.hasOne）生效。
   */
  setFooterActions(footerActions: FooterAction[]) {
    const ref = this.field.reference
    if (!ref || (!ref.isRef && !ref.hasOne)) {
      throw new Error(
        `[setFooterActions] 字段 "${this.field.fieldName}" 不是关联字段（REF/HAS_ONE），` +
          `无法设置 footerActions。请确认该字段的 reference 属性配置正确。`,
      )
    }
    this.footerActions = footerActions
    return this
  }

  /**
   * @example this.field("xxx").setFrozen(MetaUiFieldFrozen.Left)
   */
  setFrozen(val: MetaUiFieldFrozen) {
    this.frozen = val
    return this
  }

  setCustomRenderer(renderFn: UiFieldRenderer) {
    this.customRenderer = renderFn
    return this
  }

  setCustomCellRenderer(renderFn: UiCellRenderer) {
    this.customCellRenderer = renderFn
    return this
  }

  setCustomEditor(editorFn: UiFieldRenderer) {
    this.customEditor = editorFn
    return this
  }

  /**
   * 设置关联过滤器；同时写入 logic 层 filterFn 与 MetaUi 元数据上的 reference.filterFn（旧代码兼容）。
   * 可以在 filterFn 里面调用 setFieldQueryParams 方法设置当前域的搜索条件。
   */
  refFilter(filterFn: RefFilterFn) {
    if (!this?.field?.reference) {
      console.warn(`${this?.field?.fieldName || ''} field reference invalid.`)
      return this
    }
    this.filterFn = filterFn
    this.field.reference.filterFn = filterFn
    return this
  }

  refLabelFn(labelFn: (model: any) => any) {
    if (this?.field?.reference) this.field.reference.labelFn = labelFn
    else console.warn(`${this.field.fieldName} field reference invalid.`)
    return this
  }
}

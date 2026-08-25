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
 * ?????????????????
 * @remarks Vue ??????? VNode?
 */
export type UiFieldRenderer = (
  fld: MetaUiField,
  ctx: UiContext,
  props: Record<string, any>,
) => any;

export type UiCellRenderer<T = any> = (
  fld: MetaUiField,
  ctx: UiContext,
  props: Record<string, any>,
) => any;

/**
 * ???????????????????????
 *
 * @typeParam E ??????? `BOM`
 * @remarks ???????????? JS?
 */
export class MetaUiFieldLogic<E> {
  logicMethods: Record<string, Function>
  /** ????????????? */
  isSearchField?: boolean
  /** ?????????? */
  cellEditable?: boolean
  /** ?????? */
  customEditor?: Function
  /** ?????? */
  customRenderer?: Function
  /** ??????????? */
  customCellRenderer?: Function
  /** ????None/Left/Right? */
  frozen?: MetaUiFieldFrozen
  /** ???? */
  readonlyFn?: Predicate
  /** ???? */
  hiddenFn?: Predicate
  /** ???? */
  requiredFn?: Predicate
  /** ????? */
  onValidateFn?: OnValidateFn
  /** ????? */
  onWarnFn?: OnWarnFn
  /** ????? */
  onChangeFn?: OnChangeFn
  /** ???????? */
  onSearchChangeFn?: onSearchChangeFn
  /** ????? */
  selectableFn?: setSelectableFn
  /** ?????? */
  setSearchParamFn?: setSearchParamFn
  /** ???? */
  setAggregationFn?: setAggregationFn
  /** ????? */
  setFrozenFn?: (val: MetaUiFieldFrozen) => void
  /** ??????????????? */
  footerActions?: FooterAction[]
  /** ????????????????????? */
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
   * ????????
   * @example this.fieldLogic.lockIf(item => item.age > 18)
   */
  lockIf(predicate: Predicate<E>) {
    this.readonlyFn = predicate
    return this
  }

  /** ???????? `lockIf(() => true)` */
  lock() {
    return this.lockIf(() => true)
  }

  /**
   * ??????
   * @example this.fieldLogic.hideIf(item => item.age > 18)
   */
  hideIf(predicate: Predicate<E>) {
    this.hiddenFn = predicate
    return this
  }

  /** ???????? `hideIf(() => true)` */
  hide() {
    return this.hideIf(() => true)
  }

  /**
   * ??????????????????
   * @example this.fieldLogic.requiredIf(item => item.age > 18)
   */
  requiredIf(predicate: Predicate<E>) {
    if (this.requiredFn && this.requiredFn != predicate)
      this.requiredFn = logicOr(predicate, this.requiredFn)
    else this.requiredFn = predicate
    return this
  }

  /** ???????? `requiredIf(() => true)` */
  required() {
    return this.requiredIf(() => true)
  }

  /** ?????????? */
  inPlaceEdit() {
    this.cellEditable = true
    return this
  }

  /**
   * ?????????? `hidden` ? true ??????
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

  /** ???????beforeEdit? */
  onChange<P = any>(change: OnChangeFn<E, P>) {
    this.onChangeFn = change
    return this
  }

  /** ???????searchable=true? */
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
   * ?????? Footer ???? REF / HAS_ONE ???????
   */
  setFooterActions(footerActions: FooterAction[]) {
    const ref = this.field.reference
    if (!ref || (!ref.isRef && !ref.hasOne)) {
      throw new Error(
        `[setFooterActions] ?? "${this.field.fieldName}" ???????REF/HAS_ONE??` +
          `???? footerActions???????? reference ???????`,
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
   * ???????? logic ????????????? MetaUi ??????
   * ?????? `field.reference.filterFn`????????????
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

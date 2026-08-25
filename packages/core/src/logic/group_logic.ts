import type { EntityAction, ActionCallback } from '../metaui/metaui_action'
import type { Predicate } from '../metaui/metaui_field'
import type { UiContext } from './ui_context'
import type { UiGroupWatermark, Watermark } from './ui_types'
import { MetaUiField } from '../metaui/metaui_field'
import {
  MetaUiGroup,
  type CreateGroupItemsFn,
  type AddGroupItemsFn,
  type ImportGroupItemsFn,
  type GroupFilterFn,
  type OnChangeGroupFn,
} from '../metaui/metaui_group'
import { MetaUiFieldLogic } from './field_logic'

const logicOr =
  <T>(a: Predicate<T>, b: Predicate<T>): Predicate<T> =>
    value => a(value) || b(value)

/**
 * ????????
 * @typeParam E ??????? `BOM`
 * @typeParam G ??????? `BOMItem`
 */
export class MetaUiGroupFieldLogic<E, G> extends MetaUiFieldLogic<G> {
  constructor(
    field: MetaUiField,
    public readonly parent: MetaUiGroupLogic<E, G>,
  ) {
    super(field)
  }
  nextField(fieldName: string) {
    return this.parent.field(fieldName)
  }
}

export type UiGroupRenderer = (
  grp: MetaUiGroup,
  ctx: UiContext,
  props: Record<string, any>,
) => any

/**
 * ????????
 * @typeParam E ??????? `BOM`
 * @typeParam G ??????? `BOMItem`
 */
export class MetaUiGroupLogic<E, G> {
  readonly fields: Array<MetaUiGroupFieldLogic<E, G>>
  /** ?????? */
  customRenderer?: Function
  /** ?????????????? */
  customPrepend?: Function
  /** ?????????????? */
  customAppend?: Function
  /** ?? */
  watermark?: Watermark
  /** ?????? */
  watermarkFn?: UiGroupWatermark
  /** ?????? */
  _aggregate?: boolean
  /** ????? */
  customAggregator?: Function
  /** ??????????? */
  customEditor?: Function
  /** ??????????? */
  customEditPrepend?: Function
  /** ??????????? */
  customEditAppend?: Function
  /** ?????????? */
  needHandlerFile: boolean
  /** ?????? */
  importOrExportPropsFn?: ImportGroupItemsFn
  /** ??????? */
  customActions?: Array<EntityAction>
  readonlyFn?: Predicate
  hiddenFn?: Predicate
  clearIfFn?: Predicate
  editIfFn?: Predicate
  deleteIfFn?: Predicate
  importIfFn?: Predicate
  exportIfFn?: Predicate
  filterFn?: GroupFilterFn
  defaultAddFn?: ActionCallback
  beforeAddFn?: CreateGroupItemsFn
  onChangeFn?: OnChangeGroupFn

  constructor(public readonly group: MetaUiGroup) {
    this.fields = []
  }

  lockIf(predicate: Predicate<E>) {
    if (this.readonlyFn && this.readonlyFn != predicate)
      this.readonlyFn = logicOr(predicate, this.readonlyFn)
    else this.readonlyFn = predicate
    return this
  }
  hideIf(predicate: Predicate<E>) {
    this.hiddenFn = predicate
    return this
  }
  clearIf(predicate: Predicate<E>) {
    if (this.clearIfFn && this.clearIfFn != predicate)
      this.clearIfFn = logicOr(predicate, this.clearIfFn)
    else this.clearIfFn = predicate
    return this
  }
  editIf(predicate: Predicate<E>) {
    if (this.editIfFn && this.editIfFn != predicate)
      this.editIfFn = logicOr(predicate, this.editIfFn)
    else this.editIfFn = predicate
    return this
  }
  deleteIf(predicate: Predicate<E>) {
    if (this.deleteIfFn && this.deleteIfFn != predicate)
      this.deleteIfFn = logicOr(predicate, this.deleteIfFn)
    else this.deleteIfFn = predicate
    return this
  }
  importIf(predicate: Predicate<E>) {
    if (this.importIfFn && this.importIfFn != predicate)
      this.importIfFn = logicOr(predicate, this.importIfFn)
    else this.importIfFn = predicate
    return this
  }
  exportIf(predicate: Predicate<E>) {
    if (this.exportIfFn && this.exportIfFn != predicate)
      this.exportIfFn = logicOr(predicate, this.exportIfFn)
    else this.exportIfFn = predicate
    return this
  }

  /** ???????????????? */
  setFilter(filterFn: GroupFilterFn<E, G>) {
    this.filterFn = filterFn
    return this
  }

  beforeAdd(beforeAdd: CreateGroupItemsFn) {
    this.beforeAddFn = beforeAdd
    return this
  }

  defaultAdder(adder: AddGroupItemsFn<E>) {
    this.defaultAddFn = adder
    return this
  }

  defaultHandlerFile(propsFn?: ImportGroupItemsFn<E>) {
    this.needHandlerFile = true
    this.importOrExportPropsFn = propsFn
    return this
  }

  onChange(change: OnChangeGroupFn<E, G>) {
    this.onChangeFn = change
    return this
  }
  setCustomRenderer(renderFn: UiGroupRenderer) {
    this.customRenderer = renderFn
    return this
  }
  setWatermark(watermarkFn: UiGroupWatermark) {
    this.watermarkFn = watermarkFn
    return this
  }
  setCustomPrepend(renderFn: UiGroupRenderer) {
    this.customPrepend = renderFn
    return this
  }
  setCustomAppend(renderFn: UiGroupRenderer) {
    this.customAppend = renderFn
    return this
  }
  setCustomEditor(editorFn: UiGroupRenderer) {
    this.customEditor = editorFn
    return this
  }
  setCustomEditPrepend(renderFn: UiGroupRenderer) {
    this.customEditPrepend = renderFn
    return this
  }
  setCustomEditAppend(renderFn: UiGroupRenderer) {
    this.customEditAppend = renderFn
    return this
  }
  addCustomAction(action: EntityAction) {
    if (
      this.customActions &&
      this.customActions.findIndex((c) => c.name == action.name) != -1
    )
      return this
    ;(this.customActions ??= []).push(action)
    return this
  }
  removeCustomAction(name: string) {
    const actions = this.customActions
    if (actions && actions.length > 0) {
      const index = actions.findIndex((a) => a.name == name)
      if (index != -1) actions.splice(index, 1)
    }
    return this
  }

  aggregate() {
    this._aggregate = true
    return this
  }
  aggregateWith(aggregator: Function) {
    this._aggregate = true
    this.customAggregator = aggregator
    return this
  }

  /**
   * ??????????????
   */
  field(fieldName: string) {
    const field = this.group.groupUi.getField(fieldName)
    if (!field) {
      throw Error(`${fieldName} not found.`)
    }
    const fieldLogic = new MetaUiGroupFieldLogic<E, G>(field, this)
    this.fields.push(fieldLogic)
    return fieldLogic
  }
}

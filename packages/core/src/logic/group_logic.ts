import type { EntityAction, ActionCallback } from '../metaui/metaui_action'
import { MetaUiField } from '../metaui/metaui_field'
import { MetaUiGroup } from '../metaui/metaui_group'
import { parseEntityBoolExpression } from '../utils/entity_bool_expr'
import { MetaUiFieldLogic } from './field_logic'
import {
  logicAnd,
  logicOr,
  type AddGroupItemsFn,
  type BeforeItemRemoveFn,
  type CreateGroupItemsFn,
  type GroupFilterFn,
  type ItemDeletableFn,
  type OnChangeGroupFn,
  type Predicate,
} from './logic_functions'

export type SubGroupStdOp = 'add' | 'clear'

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

export class MetaUiGroupLogic<E, G> {
  readonly fields: Array<MetaUiGroupFieldLogic<E, G>>
  inplaceEditable = true
  inplaceEditStart: 'click' | 'dblclick' | 'excel' = 'excel'
  customRenderer?: Function
  customPrepend?: Function
  customAppend?: Function
  customAggregator?: Function
  customEditor?: Function
  customEditPrepend?: Function
  customEditAppend?: Function
  /** 标准操作（add / clear）。many 组默认有；canDo 往对应项叠加条件。 */
  stdActions: EntityAction[]
  /** 额外按钮。vui 渲染成图标或下拉，core 不规定。 */
  customActions?: Array<EntityAction>
  readonlyFn?: Predicate<E>
  hiddenFn?: Predicate<E>
  itemDeletableFunc?: ItemDeletableFn<E, G>
  beforeItemRemoveFunc?: BeforeItemRemoveFn<E, G>
  filterFn?: GroupFilterFn
  defaultAddFn?: ActionCallback
  beforeAddFn?: CreateGroupItemsFn
  onChangeFn?: OnChangeGroupFn

  constructor(public readonly group: MetaUiGroup) {
    this.fields = []
    this.stdActions = group.many
      ? [{ name: 'add' }, { name: 'clear' }]
      : []
    if (group.canHave) {
      const key = group.canHave
      this.hiddenFn = (model: E) => !(model as Record<string, any>)?.[key]
    }
  }

  lockIf(predicate: Predicate<E>) {
    if (this.readonlyFn && this.readonlyFn != predicate)
      this.readonlyFn = logicOr(predicate, this.readonlyFn)
    else this.readonlyFn = predicate
    return this
  }
  hideIf(predicate: Predicate<E>) {
    if (this.hiddenFn && this.hiddenFn != predicate)
      this.hiddenFn = logicOr(predicate, this.hiddenFn)
    else this.hiddenFn = predicate
    return this
  }
  lock() {
    return this.lockIf(() => true)
  }

  canDo(op: SubGroupStdOp | SubGroupStdOp[], pred: Predicate<E>) {
    const ops = Array.isArray(op) ? op : [op]
    for (const name of ops) {
      const action = this.stdActions.find(a => a.name === name)
      if (!action) continue
      action.executableExpression = andExecutable(action.executableExpression, pred)
    }
    return this
  }

  itemDeletable(fn: ItemDeletableFn<E, G>) {
    if (this.itemDeletableFunc && this.itemDeletableFunc != fn) {
      const prev = this.itemDeletableFunc
      this.itemDeletableFunc = (row, master, ctx) =>
        prev(row, master, ctx) && fn(row, master, ctx)
    } else this.itemDeletableFunc = fn
    return this
  }

  beforeItemRemove(fn: BeforeItemRemoveFn<E, G>) {
    this.beforeItemRemoveFunc = fn
    return this
  }

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

  inplaceEdit(enabled = true) {
    this.inplaceEditable = enabled
    return this
  }

  setInplaceEditStart(start: 'click' | 'dblclick' | 'excel') {
    this.inplaceEditStart = start
    return this
  }

  onChange(change: OnChangeGroupFn<E, G>) {
    this.onChangeFn = change
    return this
  }
  setCustomRenderer(renderFn: Function) {
    this.customRenderer = renderFn
    return this
  }
  setCustomPrepend(renderFn: Function) {
    this.customPrepend = renderFn
    return this
  }
  setCustomAppend(renderFn: Function) {
    this.customAppend = renderFn
    return this
  }
  setCustomEditor(editorFn: Function) {
    this.customEditor = editorFn
    return this
  }
  setCustomEditPrepend(renderFn: Function) {
    this.customEditPrepend = renderFn
    return this
  }
  setCustomEditAppend(renderFn: Function) {
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

  aggregateWith(aggregator: Function) {
    this.customAggregator = aggregator
    return this
  }

  field(fieldName: string) {
    const groupUi = this.group.groupUi
    if (!groupUi) {
      throw Error(`Group "${this.group.groupName}" has no groupUi.`)
    }
    const field = groupUi.getField(fieldName)
    if (!field) {
      throw Error(`${fieldName} not found.`)
    }
    const fieldLogic = new MetaUiGroupFieldLogic<E, G>(field, this)
    this.fields.push(fieldLogic)
    return fieldLogic
  }
}

function andExecutable(
  current: EntityAction['executableExpression'],
  pred: Predicate<any>,
): Predicate<any> {
  if (typeof current === 'function') return logicAnd(current, pred)
  if (typeof current === 'string' && current.trim())
    return logicAnd(parseEntityBoolExpression(current), pred)
  return pred
}

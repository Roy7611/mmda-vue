import type { EntityAction, ActionCallback } from '../models/entity_action'
import type { Entity } from '../models/entity'
import { MetaUiField } from '../metaui/metaui_field'
import { MetaUiGroup } from '../metaui/metaui_group'
import { parseEntityBoolExpression } from './entity_bool_expr'
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

/**
 * 子表分组里的单个字段逻辑。
 *
 * 继承 `MetaUiFieldLogic<G>`，因此拥有字段的 `lockIf / hideIf / requiredIf`、
 * `onChange`、`onValidate` 等能力；差异是它持有所属的 `MetaUiGroupLogic`，
 * 并可通过 `nextField` 取同组兄弟字段，适合做字段间联动。
 *
 * 通常不直接 `new`，而是由 `MetaUiGroupLogic.field(fieldName)` 创建。
 */
export class MetaUiGroupFieldLogic<E extends Entity, G extends Entity> extends MetaUiFieldLogic<G> {
  constructor(
    field: MetaUiField,
    public readonly parent: MetaUiGroupLogic<E, G>,
  ) {
    super(field)
  }
  /** 返回同组内另一个字段的逻辑，用于组内字段联动。 */
  nextField(fieldName: string) {
    return this.parent.field(fieldName)
  }
}

/**
 * 子表分组的视图逻辑配置。
 *
 * 这是 `MetaUiGroup` 在 Logic 层的“配置对象”，负责声明：
 * - 组内字段：`fields`，通过 `field(fieldName)` 添加。
 * - 组级只读/隐藏：`lockIf / hideIf`，求值时接收主表 `model` 和 `UiContext`。
 * - 行删除规则：`itemDeletable / beforeItemRemove`。
 * - 新增与变更回调：`beforeAdd / defaultAdder / onChange`。
 * - 标准动作 `add / clear` 与自定义动作：`canDo / addCustomAction`。
 * - 行详情嵌套：`rowDetail`。
 *
 * 创建入口是 `EntityLogic.group<G>(groupName)`，之后由 `UiContext.bindLogics()`
 * 绑定到当前会话，vui 通过 `context.getGroupLogic()` 读取这些配置。
 *
 * 注意：它只管“这组子表怎么显示和交互”，不做子表数据的 CRUD；
 * 子表行级数据逻辑由 `SubEntityLogic` 承担。
 *
 * @example
 * ```ts
 * this.group<OrderItem>('items')
 *   .lockIf((m, ctx) => m.status === 'DONE')
 *   .itemDeletable((row, master) => master.status !== 'DONE')
 *   .onChange((ctx, model, items) => model.total = items.length)
 *   .field('qty').requiredIf((row) => row.amount > 0)
 * ```
 */
export class MetaUiGroupLogic<E extends Entity = Entity, G extends Entity = Entity> {
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
  filterFn?: GroupFilterFn<E, G>
  defaultAddFn?: ActionCallback
  beforeAddFn?: CreateGroupItemsFn<E, G>
  onChangeFn?: OnChangeGroupFn<E, G>
  /** 行实体上的 many 组名；表格行展开画该孙子组，不是 TreeGrid 子行。 */
  rowDetailGroup?: string

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

  beforeAdd(beforeAdd: CreateGroupItemsFn<E, G>) {
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

  /** 行展开嵌套另一套 MetaUi 的 many 组（如 items → operations）。只嵌一层。 */
  rowDetail(name: string) {
    this.rowDetailGroup = name
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

import { MetaUiField } from '../metaui/metaui_field'
import type { UiContext } from './ui_context'
import {
  logicOr,
  sqlAnd,
  type OnChangeFn,
  type OnValidateFn,
  type Predicate,
  type RefFilterFn,
  type AggregateFn,
  type CustomFieldRenderFn,
} from './logic_functions'
import {
  customValidator,
  descriptorsToValidators,
  type FieldValidator,
  type ValidatorSeverity,
} from './validators'

/**
 * 元域逻辑：只读、隐藏、校验、变更。自定义渲染由 vui 消费，VNode 类型在 vui。
 */
export class MetaUiFieldLogic<E> {
  /** 对应的元数据字段（Data SSOT；Logic 不改写 readOnly / hidden / nullable）。 */
  constructor(public readonly field: MetaUiField) {
    this.hasField()
    this.validators = descriptorsToValidators(field?.validatorDescriptors)
  }

  /** 列级是否允许表格原位编辑；与 lockIf 无关。子表组默认开，inplaceEdit(false) 关单列。 */
  inplaceEditable?: boolean
  /** 表单自定义编辑器；vui 消费，返回值常为 VNode。 */
  customEditor?: CustomFieldRenderFn
  /** 表单自定义展示；vui 消费，返回值常为 VNode。 */
  customRenderer?: CustomFieldRenderFn
  /** 列表单元格自定义展示。 */
  customCellRenderer?: CustomFieldRenderFn
  /** 列表单元格自定义编辑。 */
  customCellEditor?: CustomFieldRenderFn
  /** 业务只读条件；多次 lockIf OR 叠加。求值：field.readOnly || readonlyFn。 */
  readonlyFn?: Predicate<E>
  /** 业务隐藏条件；多次 hideIf OR。求值：field.hidden || hiddenFn。 */
  hiddenFn?: Predicate<E>
  /** 业务必填条件；多次 requiredIf OR。求值：!field.nullable || requiredFn。 */
  requiredFn?: Predicate<E>
  /** 最近一次 onValidate 回调（兼容）；真正跑的是 validators。 */
  onValidateFn?: OnValidateFn<unknown, E>
  /** 校验器列表；构造从元数据 validatorDescriptors 种子，onValidate 追加。 */
  validators: FieldValidator[] = []
  /** 值变更回调。 */
  onChangeFn?: OnChangeFn<E, any>
  /** 列表/子表合计自定义；vui 读此函数，返回 number。 */
  aggregateFn?: AggregateFn<E>
  /** 引用范围 SQL 片段列表；refFilter 追加，buildRefFilter 与元数据 where AND。 */
  private readonly refFilters: RefFilterFn<E>[] = []

  private hasField() {
    if (!this.field) {
      console.warn(`${this?.field?.fieldName || ''} field invalid.`)
    }
    return this
  }

  lockIf(predicate: Predicate<E>) {
    if (this.readonlyFn && this.readonlyFn != predicate)
      this.readonlyFn = logicOr(predicate, this.readonlyFn)
    else this.readonlyFn = predicate
    return this
  }

  lock() {
    return this.lockIf(() => true)
  }

  hideIf(predicate: Predicate<E>) {
    if (this.hiddenFn && this.hiddenFn != predicate)
      this.hiddenFn = logicOr(predicate, this.hiddenFn)
    else this.hiddenFn = predicate
    return this
  }

  hide() {
    return this.hideIf(() => true)
  }

  requiredIf(predicate: Predicate<E>) {
    if (this.requiredFn && this.requiredFn != predicate)
      this.requiredFn = logicOr(predicate, this.requiredFn)
    else this.requiredFn = predicate
    return this
  }

  required() {
    return this.requiredIf(() => true)
  }

  /** 表格单元格是否可原位编辑。子表组默认开启；传 false 关闭单个字段。 */
  inplaceEdit(enabled = true) {
    this.inplaceEditable = enabled
    return this
  }

  onValidate<V = unknown>(
    validate: OnValidateFn<V, E>,
    severity: ValidatorSeverity = 'error',
  ) {
    this.onValidateFn = validate as OnValidateFn<unknown, E>
    this.validators.push(customValidator(validate as OnValidateFn, severity))
    return this
  }

  onChange<P = unknown>(change: OnChangeFn<E, P>) {
    this.onChangeFn = change
    return this
  }

  aggregate(fn: AggregateFn<E>) {
    this.aggregateFn = fn
    return this
  }

  setCustomRenderer(renderFn: CustomFieldRenderFn) {
    this.customRenderer = renderFn
    return this
  }

  setCustomCellRenderer(renderFn: CustomFieldRenderFn) {
    this.customCellRenderer = renderFn
    return this
  }

  setCustomCellEditor(editorFn: CustomFieldRenderFn) {
    this.customCellEditor = editorFn
    return this
  }

  setCustomEditor(editorFn: CustomFieldRenderFn) {
    this.customEditor = editorFn
    return this
  }

  /**
   * 追加引用范围限制（SQL 片段）。与元数据 reference.where AND，多次调用叠加。
   */
  refFilter(filterFn: RefFilterFn<E>) {
    if (!this?.field?.reference) {
      console.warn(`${this?.field?.fieldName || ''} field reference invalid.`)
      return this
    }
    this.refFilters.push(filterFn)
    return this
  }

  /** 元数据 where 与已登记 refFilter 的 AND 结果。 */
  buildRefFilter(
    model: E,
    ctx: UiContext<E & object>,
    fieldOptions?: Record<string, unknown>,
  ): string | undefined {
    let filter = this.field.reference?.where
    for (const fn of this.refFilters) {
      filter = sqlAnd(filter, fn(model, ctx, fieldOptions))
    }
    return filter
  }

  /**
   * 组装关联引用查询 filter：buildRefFilter + @param 替换 + searchWord LIKE。
   * 元数据 MetaUiFieldRef 只提供 where / refFlds，不负责拼查询。
   */
  buildRefSearchFilter(
    model: E,
    ctx: UiContext<E & object>,
    searchWord?: string,
    fieldOptions?: Record<string, unknown>,
  ): string | undefined {
    const ref = this.field.reference
    if (!ref) return undefined
    let filter = this.buildRefFilter(model, ctx, fieldOptions)
    if (filter && filter.indexOf('@') != -1) {
      filter = filter.replaceAll(/@(\w+)/gi, (p: string) => (model as any)[p.substring(1)])
    }
    if (searchWord) {
      const conditions: string[] = []
      conditions.push(`t.${ref.refFlds[1]} LIKE %${searchWord}%`)
      if (ref.hasExtraRefFields)
        conditions.push(`t.${ref.refFlds[2]} LIKE %${searchWord}%`)
      filter = sqlAnd(filter, conditions.join(' OR '))
    }
    return filter
  }

  /** 引用选项显示标签；写入元数据 reference.labelFn。 */
  refLabelFn(labelFn: (option: Record<string, unknown>) => string) {
    if (this?.field?.reference) this.field.reference.labelFn = labelFn as any
    else console.warn(`${this.field.fieldName} field reference invalid.`)
    return this
  }
}

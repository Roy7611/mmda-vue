import type { MetaUiField } from '../metaui/metaui_field'
import type { Translatable } from '../metaui/metaui_field'
import type { UiContext } from './ui_context'

/** 实体/行条件。程序员在 lockIf / hideIf / requiredIf 中使用。 */
export type Predicate<T = unknown> = (t: T, context?: UiContext) => boolean

export const logicOr =
  <T>(a: Predicate<T>, b: Predicate<T>): Predicate<T> =>
    (value, context) =>
      a(value, context) || b(value, context)

export const logicAnd =
  <T>(a: Predicate<T>, b: Predicate<T>): Predicate<T> =>
    (value, context) =>
      a(value, context) && b(value, context)

/** 拼接 SQL 条件片段（空串视为缺省）。与 logicAnd（谓词）并列。 */
export function sqlAnd(a?: string, b?: string) {
  if (!a) return b
  else if (!b) return a
  return `(${a}) AND (${b})`
}

export function sqlOr(a?: string, b?: string) {
  if (!a) return b
  else if (!b) return a
  return `(${a}) OR (${b})`
}

export type OnChangeFn<E = any, T = any> = (
  context: UiContext<E & object>,
  model: E,
  newVal: T,
  oldVal: T,
) => void

export type OnValidateFn<T = any, E = any> = (
  value: T,
  model: E,
  ctx?: UiContext<E & object>,
) => string | Translatable | undefined

/** 关联引用的额外 SQL 片段；由 refFilter 叠加，与元数据 where AND。 */
export type RefFilterFn<T = unknown> = (
  model: T,
  ctx: UiContext<T & object>,
  fieldOptions?: Record<string, unknown>,
) => string

/** 列表/子表合计；返回数值供格式化展示。 */
export type AggregateFn<T = unknown> = (
  context: UiContext,
  field: MetaUiField,
  model: T,
) => number

/**
 * 表单/单元格自定义渲染或编辑。
 * 返回值由 vui 解释（常为 VNode）；core 不依赖 Vue。
 */
export type CustomFieldRenderFn = (
  field: MetaUiField,
  context: UiContext,
  props?: Record<string, unknown>,
) => unknown

export type CreateGroupItemsFn = (
  context: any,
  entity: any,
  items: any[],
) => Promise<boolean>

export type OnChangeGroupFn<E = any, G = any> = (
  context: any,
  model: E,
  items: G[],
) => any

export type GroupFilterFn<E = any, G = any> = (
  context: any,
  model: E,
  items: G[],
) => any

export type AddGroupItemsFn<E = any> = (context: any, model: E) => any

/** 子表行是否可删（行 + 主表）。 */
export type ItemDeletableFn<E = any, G = any> = (
  row: G,
  master: E,
  ctx?: UiContext,
) => boolean

/** 确认删行后、真正移除前；返回 false 取消。 */
export type BeforeItemRemoveFn<E = any, G = any> = (
  row: G,
  master: E,
  ctx?: UiContext,
) => boolean | Promise<boolean>

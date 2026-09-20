import type { MetaUiField } from '../metaui/metaui_field'
import type { Translatable } from '../metaui/metaui_field'
import type { Entity } from '../models/entity'
import type { UiContext } from '../ui/context'

/** 实体/行条件。程序员在 lockIf / hideIf / requiredIf 中使用。 */
export type Predicate<T extends Entity = Entity> = (
  t: T,
  context?: UiContext<T>,
) => boolean

/**
 * 组合两个谓词：任一为真即通过。
 *
 * 用于把多个业务条件合成一个谓词；字段逻辑的 `lockIf / hideIf / requiredIf`
 * 连续调用已经自带 OR 叠加，这里的 `logicOr` 主要用于显式组合自定义条件。
 *
 * @example
 * ```ts
 * const draft = (m: Order, ctx) => m.status === 'draft'
 * const newOrder = (m: Order, ctx) => !m.id
 * field.lockIf(logicOr(draft, newOrder))
 * ```
 */
export const logicOr =
  <T extends Entity>(a: Predicate<T>, b: Predicate<T>): Predicate<T> =>
    (value, context) =>
      a(value, context) || b(value, context)

/**
 * 组合两个谓词：两者同时为真才通过。
 *
 * 用于给一个条件叠加“且”约束；多个条件时把结果继续嵌套即可。
 *
 * @example
 * ```ts
 * field.requiredIf(logicAnd(
 *   (m) => m.qty > 0,
 *   (m, ctx) => !ctx.isInDialog,
 * ))
 * ```
 */
export const logicAnd =
  <T extends Entity>(a: Predicate<T>, b: Predicate<T>): Predicate<T> =>
    (value, context) =>
      a(value, context) && b(value, context)

/**
 * 拼接两个 SQL WHERE 片段，空片段会被忽略。
 *
 * 返回结果自带括号，适合在 `refWhere` 或元数据 `reference.where` 叠加时使用。
 * 注意：这是 SQL 字符串拼接，不是谓词求值，别和 {@link logicAnd} 混用。
 *
 * @example
 * ```ts
 * const where = sqlAnd("status != 'CANCELED'", sqlOr("qty > 0", "amount > 0"))
 * ```
 */
export function sqlAnd(a?: string, b?: string) {
  if (!a) return b
  else if (!b) return a
  return `(${a}) AND (${b})`
}

/**
 * 拼接两个 SQL WHERE 片段为“或”，空片段会被忽略。
 *
 * 和 {@link sqlAnd} 一样用于 SQL 片段组合；空串、`undefined` 会被跳过。
 *
 * @example
 * ```ts
 * const where = sqlOr("status == 'draft'", "status == 'open'")
 * ```
 */
export function sqlOr(a?: string, b?: string) {
  if (!a) return b
  else if (!b) return a
  return `(${a}) OR (${b})`
}

/** 字段值变化回调：`context` 是当前会话上下文，`model` 是字段所属实体。 */
export type OnChangeFn<E extends Entity = Entity, T = unknown> = (
  context: UiContext<E>,
  model: E,
  newVal: T,
  oldVal: T,
) => void

/** 字段校验回调：返回错误文案或 `undefined`；`ctx` 为可选，用于读取字段/上下文状态。 */
export type OnValidateFn<T = unknown, E = unknown> = (
  value: T,
  model: E,
  ctx?: UiContext,
) => string | Translatable | undefined

/** 关联引用的额外 SQL WHERE 片段；由 refWhere 叠加，与元数据 where AND。 */
export type RefWhereFn<T extends Entity = Entity> = (
  model: T,
  ctx: UiContext<T>,
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

/** 批量创建子表行前的钩子：返回 `false` 可取消创建；`items` 是即将追加的行。 */
export type CreateGroupItemsFn<E extends Entity = Entity, G extends Entity = Entity> = (
  context: UiContext<E>,
  entity: E,
  items: G[],
) => Promise<boolean>

/** 子表行集合变化后的回调：新增、删除、批量写入等操作后触发。 */
export type OnChangeGroupFn<E extends Entity = Entity, G extends Entity = Entity> = (
  context: UiContext<E>,
  model: E,
  items: G[],
) => unknown

/** 子表行过滤：由 vui 在展示前调用，返回值交给对应 UI 实现解释。 */
export type GroupFilterFn<E extends Entity = Entity, G extends Entity = Entity> = (
  context: UiContext<E>,
  model: E,
  items: G[],
) => unknown

/** 自定义子表“新增”逻辑：不满足默认批量创建流程时使用。 */
export type AddGroupItemsFn<E extends Entity = Entity> = (
  context: UiContext<E>,
  model: E,
) => unknown

/** 子表行是否可删（行 + 主表）。 */
export type ItemDeletableFn<E extends Entity = Entity, G = unknown> = (
  row: G,
  master: E,
  ctx?: UiContext<E>,
) => boolean

/** 确认删行后、真正移除前；返回 false 取消。 */
export type BeforeItemRemoveFn<E extends Entity = Entity, G = unknown> = (
  row: G,
  master: E,
  ctx?: UiContext<E>,
) => boolean | Promise<boolean>

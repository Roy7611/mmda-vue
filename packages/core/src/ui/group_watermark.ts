/*
 * 分组水印：业务 Logic 在 `beforeIndex` / `beforeDetails` 里给某个分组挂一个角标
 * （如质检「合格 / 不合格」）。实现只用 core 类型，所以住 core；
 * 视图侧读它（`getGroupWatermark`）决定怎么画。
 */
import type { Entity } from '../models/entity'
import type { MetaUiGroup } from '../metaui/metaui_group'
import type { MetaUiGroupLogic } from '../logic/group_logic'
import type { UiContext } from './context'

export interface Watermark {
  color?: string
  label?: string
}

/** `grp` 未用；`ctx` 是该项（子实体）的会话。 */
export type UiGroupWatermark<G extends Entity = Entity> = (
  grp: MetaUiGroup,
  ctx: UiContext<G>,
  props: Record<string, unknown>,
) => Watermark | void

/**
 * 键是分组逻辑对象，值是擦掉实体型的回调（每个分组挂自己的子实体类型，这里必须擦）。
 */
type ErasedGroupWatermark = UiGroupWatermark<Entity>
const groupWatermarks = new WeakMap<object, ErasedGroupWatermark>()

/** 给分组挂水印，返回同一个分组逻辑（便于 `groups.push(...)` 直接串起来）。 */
export function setGroupWatermark<E extends Entity, G extends Entity>(
  logic: MetaUiGroupLogic<E, G>,
  watermark: UiGroupWatermark<G>,
): MetaUiGroupLogic<E, G> {
  groupWatermarks.set(logic, watermark as unknown as ErasedGroupWatermark)
  return logic
}

export function getGroupWatermark<G extends Entity = Entity>(
  logic: MetaUiGroupLogic<Entity, G>,
): UiGroupWatermark<G> | undefined {
  return groupWatermarks.get(logic) as unknown as UiGroupWatermark<G> | undefined
}

import type { MetaUiGroup } from '@mmda/core'
import type { MetaUiGroupLogic } from '@mmda/core'
import type { UiContext } from '@mmda/core'

export interface Watermark {
  color?: string
  label?: string
}

export type UiGroupWatermark = (
  grp: MetaUiGroup,
  ctx: UiContext<any>,
  props: Record<string, any>,
) => Watermark | void

const groupWatermarks = new WeakMap<object, UiGroupWatermark>()

export function setGroupWatermark(
  logic: MetaUiGroupLogic<any, any>,
  watermark: UiGroupWatermark,
) {
  groupWatermarks.set(logic, watermark)
  return logic
}

export function getGroupWatermark(
  logic: MetaUiGroupLogic<any, any>,
): UiGroupWatermark | undefined {
  return groupWatermarks.get(logic)
}

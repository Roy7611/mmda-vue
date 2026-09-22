import type { MetaUiGroup } from '@mmda/core'
import type { MetaUiGroupLogic } from '@mmda/core'
import type { UiContext } from '@mmda/core'

export interface Watermark {
  color?: string
  label?: string
}

export type VuiGroupWatermark = (
  grp: MetaUiGroup,
  ctx: UiContext<any>,
  props: Record<string, any>,
) => Watermark | void

const groupWatermarks = new WeakMap<object, VuiGroupWatermark>()

export function setGroupWatermark(
  logic: MetaUiGroupLogic<any, any>,
  watermark: VuiGroupWatermark,
) {
  groupWatermarks.set(logic, watermark)
  return logic
}

export function getGroupWatermark(
  logic: MetaUiGroupLogic<any, any>,
): VuiGroupWatermark | undefined {
  return groupWatermarks.get(logic)
}

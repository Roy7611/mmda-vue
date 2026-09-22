/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/rating/vue-3-getting-started
 *
 * chrome 评分走 factory.rating。星数 / 只读用 EJ2：itemsCount / readOnly。
 * 换形状用 emptyTemplate / fullTemplate，不要 vui 主名 stars / onIcon / shape。
 * 字段 fieldFactory.rating 译 MetaUiField 后再调本控件。
 */
import type { VNodeChild } from 'vue'
import type {UiProps} from '@mmda/core'
import { DEFAULT_RATING_ITEMS_COUNT as coreRatingItemsCount } from '@mmda/core'
export {
  DEFAULT_RATING_ITEMS_COUNT,
  ratingPropsFromField,
} from '@mmda/core'

export type {
  UiRatingProps,
  UiRatingTemplate,
  UiRatingTemplateContext,
} from '@mmda/core'
import type {
  UiRatingProps,
  UiRatingTemplate,
  UiRatingTemplateContext,
} from '@mmda/core'
import { vuiUpdateOf } from '../vui_props'
import type { VuiModelProps } from '../vui_props'

export type { UiFieldBindContext as RatingFieldContext } from '@mmda/core'

function finiteNumber(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export function ratingItemsCountOf(props: UiRatingProps): number {
  const n = finiteNumber(props.itemsCount)
  if (n != null && n >= 1) return Math.floor(n)
  return coreRatingItemsCount
}

export function ratingValueOf(
  props: VuiModelProps<UiRatingProps>,
): number | null {
  const raw =
    props.value !== undefined ? props.value : props.modelValue
  const n = finiteNumber(raw)
  return n ?? null
}

export function ratingReadOnlyOf(props: UiRatingProps): boolean {
  return props.readOnly === true || String(props.readOnly) === 'true'
}

export function emitRatingChange(
  props: UiRatingProps,
  value: unknown,
): void {
  const unpacked =
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'value' in value
      ? (value as { value?: unknown }).value
      : value
  const next = finiteNumber(unpacked) ?? null
  props.onChange?.(next)
  vuiUpdateOf(props)?.(next)
}

export function resolveRatingTemplate(
  template: UiRatingTemplate | undefined,
  ctx: UiRatingTemplateContext,
): VNodeChild {
  if (template == null) return undefined
  if (typeof template === 'function') return template(ctx)
  return template
}

export { ratingModifierClasses } from '@mmda/core'

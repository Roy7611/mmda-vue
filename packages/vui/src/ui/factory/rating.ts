/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/rating/vue-3-getting-started
 *
 * chrome 评分走 factory.rating。星数 / 只读用 EJ2：itemsCount / readOnly。
 * 换形状用 emptyTemplate / fullTemplate，不要 vui 主名 stars / onIcon / shape。
 * 字段 fieldFactory.rating 译 MetaUiField 后再调本控件。
 */
import type { VNodeChild } from 'vue'
import { callUiBagFn } from '@mmda/core'
import type { MetaUiField } from '@mmda/core'
import type {UiProps} from '../layout/layout'

export const DEFAULT_RATING_ITEMS_COUNT = 5

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

export type RatingFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

function finiteNumber(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export function ratingItemsCountOf(props: UiRatingProps): number {
  const n = finiteNumber(props.itemsCount)
  if (n != null && n >= 1) return Math.floor(n)
  return DEFAULT_RATING_ITEMS_COUNT
}

export function ratingValueOf(props: UiRatingProps): number | null {
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
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
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

function itemsCountFromField(
  field: MetaUiField,
  extra: UiProps,
): number | undefined {
  if (extra.itemsCount != null && extra.itemsCount !== '') {
    const n = finiteNumber(extra.itemsCount)
    if (n != null && n >= 1) return Math.floor(n)
  }
  const max = field.maxLength
  if (typeof max === 'number' && max >= 1 && max <= 10) return max
  return undefined
}

export function ratingPropsFromField(
  field: MetaUiField,
  context: RatingFieldContext,
  extra: UiProps = {},
): UiRatingProps {
  const raw = context.getFieldValue(field)
  const n = finiteNumber(raw)
  return {
    value: n ?? null,
    itemsCount: itemsCountFromField(field, extra),
    readOnly:
      (extra.readOnly as boolean | undefined) ?? context.isFieldReadonly(field),
    disabled: extra.disabled as boolean | undefined,
    emptyTemplate: extra.emptyTemplate,
    fullTemplate: extra.fullTemplate,
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

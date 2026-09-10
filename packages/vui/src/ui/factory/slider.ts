/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/range-slider/vue-3-getting-started
 *
 * chrome 滑块走 factory.slider。type 用 EJ2：Default / MinRange / Range。
 * 不要把 Prime range: boolean 写进 vui。Range Slider 文档就是本控件。
 * 字段 fieldFactory.slider 译 MetaUiField 后再调本控件。
 */
import { callUiBagFn } from '@mmda/core'
import type { MetaUiField, UiSliderProps, UiSliderType, UiSliderValue } from '@mmda/core'
import type {UiProps} from '../layout/layout'

export const DEFAULT_SLIDER_MIN = 0
export const DEFAULT_SLIDER_MAX = 100
export const DEFAULT_SLIDER_STEP = 1

export type { UiSliderType, UiSliderValue, UiSliderProps } from '@mmda/core'

export type SliderFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

function finiteNumber(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export function sliderMinOf(props: UiSliderProps): number {
  return finiteNumber(props.min) ?? DEFAULT_SLIDER_MIN
}

export function sliderMaxOf(props: UiSliderProps): number {
  return finiteNumber(props.max) ?? DEFAULT_SLIDER_MAX
}

export function sliderStepOf(props: UiSliderProps): number {
  const n = finiteNumber(props.step)
  if (n != null && n > 0) return n
  return DEFAULT_SLIDER_STEP
}

export function sliderTypeOf(props: UiSliderProps): UiSliderType {
  if (props.type === 'MinRange' || props.type === 'Range' || props.type === 'Default') {
    return props.type
  }
  const raw = sliderRawValue(props)
  if (Array.isArray(raw) && raw.length >= 2) return 'Range'
  return 'Default'
}

function sliderRawValue(props: UiSliderProps): unknown {
  if (props.value !== undefined) return props.value
  if (props.modelValue !== undefined) return props.modelValue
  return undefined
}

function pairOf(raw: unknown, min: number, max: number): number[] {
  if (Array.isArray(raw) && raw.length >= 2) {
    const a = finiteNumber(raw[0]) ?? min
    const b = finiteNumber(raw[1]) ?? max
    return a <= b ? [a, b] : [b, a]
  }
  const n = finiteNumber(raw)
  if (n == null) return [min, max]
  return [min, n]
}

export function sliderValueOf(props: UiSliderProps): number | number[] {
  const type = sliderTypeOf(props)
  const min = sliderMinOf(props)
  const max = sliderMaxOf(props)
  const raw = sliderRawValue(props)
  if (type === 'Range') return pairOf(raw, min, max)
  if (raw == null || raw === '') return min
  if (Array.isArray(raw)) return finiteNumber(raw[0]) ?? min
  return finiteNumber(raw) ?? min
}

export function emitSliderChange(props: UiSliderProps, value: unknown): void {
  const type = sliderTypeOf(props)
  const min = sliderMinOf(props)
  const max = sliderMaxOf(props)
  let next: UiSliderValue = null
  const unpacked =
    value != null && typeof value === 'object' && !Array.isArray(value) && 'value' in value
      ? (value as { value?: unknown }).value
      : value
  if (type === 'Range') {
    next = pairOf(unpacked, min, max)
  } else if (unpacked != null && unpacked !== '') {
    const n = finiteNumber(Array.isArray(unpacked) ? unpacked[0] : unpacked)
    next = n ?? null
  }
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

export { sliderModifierClasses } from '@mmda/core'

export function sliderPropsFromField(
  field: MetaUiField,
  context: SliderFieldContext,
  extra: UiProps = {},
): UiSliderProps {
  const typeRaw = extra.type
  const type: UiSliderType | undefined =
    typeRaw === 'MinRange' || typeRaw === 'Range' || typeRaw === 'Default'
      ? typeRaw
      : undefined
  const raw = context.getFieldValue(field)
  return {
    value: (raw ?? null) as UiSliderValue,
    min: extra.min as number | undefined,
    max: extra.max as number | undefined,
    step: extra.step as number | undefined,
    type,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
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

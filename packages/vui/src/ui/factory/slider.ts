/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/range-slider/vue-3-getting-started
 *
 * chrome 滑块走 factory.slider。type 用 EJ2：Default / MinRange / Range。
 * 不要把 Prime range: boolean 写进 vui。Range Slider 文档就是本控件。
 * 字段 fieldFactory.slider 译 MetaUiField 后再调本控件。
 */
import type { UiSliderProps, UiSliderType, UiSliderValue } from '@mmda/core'
import type {UiProps} from '@mmda/core'
import { vuiUpdateOf, type VuiModelProps } from '../vui_props'
import {
  DEFAULT_SLIDER_MIN as coreSliderMin,
  DEFAULT_SLIDER_MAX as coreSliderMax,
  DEFAULT_SLIDER_STEP as coreSliderStep,
} from '@mmda/core'
export {
  DEFAULT_SLIDER_MIN,
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_STEP,
  sliderPropsFromField,
} from '@mmda/core'

export type { UiSliderType, UiSliderValue, UiSliderProps } from '@mmda/core'

export type { UiFieldBindContext as SliderFieldContext } from '@mmda/core'

function finiteNumber(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export function sliderMinOf(props: UiSliderProps): number {
  return finiteNumber(props.min) ?? coreSliderMin
}

export function sliderMaxOf(props: UiSliderProps): number {
  return finiteNumber(props.max) ?? coreSliderMax
}

export function sliderStepOf(props: UiSliderProps): number {
  const n = finiteNumber(props.step)
  if (n != null && n > 0) return n
  return coreSliderStep
}

export function sliderTypeOf(
  props: VuiModelProps<UiSliderProps>,
): UiSliderType {
  if (props.type === 'MinRange' || props.type === 'Range' || props.type === 'Default') {
    return props.type
  }
  const raw = sliderRawValue(props)
  if (Array.isArray(raw) && raw.length >= 2) return 'Range'
  return 'Default'
}

function sliderRawValue(props: VuiModelProps<UiSliderProps>): unknown {
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

export function sliderValueOf(
  props: VuiModelProps<UiSliderProps>,
): number | number[] {
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
  vuiUpdateOf(props)?.(next)
}

export { sliderModifierClasses } from '@mmda/core'

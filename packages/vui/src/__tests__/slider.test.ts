import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SLIDER_MAX,
  DEFAULT_SLIDER_MIN,
  sliderMaxOf,
  sliderMinOf,
  sliderStepOf,
  sliderTypeOf,
  sliderValueOf,
} from '../ui/factory/slider'

describe('slider chrome helpers', () => {
  it('defaults min 0 max 100 step 1 and type Default', () => {
    expect(sliderMinOf({})).toBe(DEFAULT_SLIDER_MIN)
    expect(sliderMaxOf({})).toBe(DEFAULT_SLIDER_MAX)
    expect(sliderStepOf({})).toBe(1)
    expect(sliderTypeOf({})).toBe('Default')
  })

  it('infers Range from a pair value', () => {
    expect(sliderTypeOf({ value: [10, 40] })).toBe('Range')
    expect(sliderValueOf({ value: [40, 10] })).toEqual([10, 40])
  })

  it('keeps Default numeric value', () => {
    expect(sliderValueOf({ value: 25, type: 'Default' })).toBe(25)
    expect(sliderValueOf({ modelValue: 8 } as any)).toBe(8)
  })
})

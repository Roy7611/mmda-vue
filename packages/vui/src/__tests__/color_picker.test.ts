import { describe, expect, it, vi } from 'vitest'
import {
  colorPickerHexOf,
  colorPickerModifierClasses,
  colorPickerPropsFromField,
  colorPickerValueOf,
  emitColorPickerChange,
} from '../ui/factory/color_picker'

describe('colorPicker helpers', () => {
  it('normalizes hex and prefers value over modelValue', () => {
    expect(colorPickerHexOf('035a')).toBe('#035a')
    expect(colorPickerHexOf('#7b1fa2')).toBe('#7b1fa2')
    expect(colorPickerValueOf({ value: '#111', modelValue: '#222' })).toBe('#111')
    expect(colorPickerValueOf({ modelValue: 'abc' })).toBe('#abc')
    expect(colorPickerValueOf({})).toBeUndefined()
  })

  it('turns vendor rgb/hsv into hex', () => {
    expect(colorPickerHexOf('rgba(123, 31, 162, 1)')).toBe('#7b1fa2')
    expect(colorPickerHexOf({ r: 123, g: 31, b: 162 })).toBe('#7b1fa2')
  })

  it('emits hex on onChange and v-model', () => {
    const onChange = vi.fn()
    const onModel = vi.fn()
    emitColorPickerChange(
      { onChange, 'onUpdate:modelValue': onModel },
      'rgba(123, 31, 162, 1)',
    )
    expect(onChange).toHaveBeenCalledWith('#7b1fa2')
    expect(onModel).toHaveBeenCalledWith('#7b1fa2')
  })

  it('adds palette hook class', () => {
    expect(colorPickerModifierClasses({}).join(' ')).toContain('mmda-colorpicker')
    expect(colorPickerModifierClasses({ mode: 'palette' }).join(' ')).toContain(
      'mmda-colorpicker--palette',
    )
  })

  it('translates field value as hex', () => {
    const field = { fieldName: 'tint', displayLabel: '色' } as any
    const setFieldValue = vi.fn()
    const props = colorPickerPropsFromField(field, {
      getFieldValue: () => '#035a',
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.value).toBe('#035a')
    expect(props.htmlAttributes).toMatchObject({ name: 'tint', id: 'tint' })
    props.onChange?.('#fff')
    expect(setFieldValue).toHaveBeenCalledWith(field, '#fff')
  })
})

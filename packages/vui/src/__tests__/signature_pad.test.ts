import { describe, expect, it, vi } from 'vitest'
import {
  emitSignaturePadChange,
  signaturePadActionOf,
  signaturePadBlobOf,
  signaturePadFileTypeFromEj2,
  signaturePadFileTypeOf,
  signaturePadModifierClasses,
  signaturePadPropsFromField,
  signaturePadValueOf,
} from '@mmda/core'

describe('signaturePad helpers', () => {
  it('reads empty and data URL from value over modelValue', () => {
    expect(signaturePadValueOf({})).toBe('')
    expect(
      signaturePadValueOf({
        value: 'data:image/png;base64,abc',
        modelValue: 'other',
      }),
    ).toBe('data:image/png;base64,abc')
    expect(signaturePadValueOf({ modelValue: '' })).toBe('')
  })

  it('maps vui file types to EJ2 and back', () => {
    expect(signaturePadFileTypeOf()).toBe('Png')
    expect(signaturePadFileTypeOf('jpeg')).toBe('Jpeg')
    expect(signaturePadFileTypeOf('svg')).toBe('Svg')
    expect(signaturePadFileTypeFromEj2('Jpeg')).toBe('jpeg')
    expect(signaturePadFileTypeFromEj2('Svg')).toBe('svg')
  })

  it('maps EJ2 actionName', () => {
    expect(signaturePadActionOf('mouseUp')).toBe('mouseUp')
    expect(signaturePadActionOf('MouseUp')).toBe('mouseUp')
    expect(signaturePadActionOf('undo')).toBe('undo')
    expect(signaturePadActionOf('nope')).toBeUndefined()
  })

  it('emits onChange with action and v-model value', () => {
    const onChange = vi.fn()
    const onModel = vi.fn()
    emitSignaturePadChange(
      { onChange, 'onUpdate:modelValue': onModel },
      '',
      'clear',
    )
    expect(onChange).toHaveBeenCalledWith('', 'clear')
    expect(onModel).toHaveBeenCalledWith('')
  })

  it('decodes a PNG data URL to a blob', () => {
    const blob = signaturePadBlobOf(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    )
    expect(blob).not.toBeNull()
    expect(blob?.type).toBe('image/png')
    expect(signaturePadBlobOf('')).toBeNull()
  })

  it('adds readonly and disabled hook classes', () => {
    expect(signaturePadModifierClasses({}).join(' ')).toContain('mmda-signature-pad')
    expect(signaturePadModifierClasses({ readOnly: true }).join(' ')).toContain(
      'mmda-signature-pad--readonly',
    )
    expect(signaturePadModifierClasses({ disabled: true }).join(' ')).toContain(
      'mmda-signature-pad--disabled',
    )
  })

  it('translates field value as a string and writes back', () => {
    const field = { fieldName: 'sign' } as any
    const setFieldValue = vi.fn()
    const props = signaturePadPropsFromField(field, {
      getFieldValue: () => 'data:image/png;base64,abc',
      setFieldValue,
      isFieldReadonly: () => true,
    })
    expect(props.value).toBe('data:image/png;base64,abc')
    expect(props.readOnly).toBe(true)
    expect(props.htmlAttributes).toMatchObject({ name: 'sign', id: 'sign' })
    props.onChange?.('', 'clear')
    expect(setFieldValue).toHaveBeenCalledWith(field, '')
  })
})

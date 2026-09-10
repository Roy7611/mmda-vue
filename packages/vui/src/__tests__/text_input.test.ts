import { describe, expect, it, vi } from 'vitest'
import { emitTextInputBlur, emitTextInputFocus, textInputHtmlTypeOf, textInputPlaceholderOf, textInputPropsFromField, textInputTypeOf, textInputValueOf } from '@mmda/core'
import { emitTextInputChange } from '@mmda/vui'

describe('textInput chrome helpers', () => {
  it('defaults value empty and type Text', () => {
    expect(textInputValueOf({})).toBe('')
    expect(textInputTypeOf({})).toBe('Text')
  })

  it('reads value from value or modelValue', () => {
    expect(textInputValueOf({ value: 'a' })).toBe('a')
    expect(textInputValueOf({ modelValue: 'b' } as any)).toBe('b')
  })

  it('maps lowercase password to Password', () => {
    expect(textInputTypeOf({ type: 'password' as any })).toBe('Password')
    expect(textInputHtmlTypeOf('Password')).toBe('password')
  })

  it('reads placeholder', () => {
    expect(textInputPlaceholderOf({})).toBeUndefined()
    expect(textInputPlaceholderOf({ placeholder: 'hint' })).toBe('hint')
  })

  it('unpacks EJ2 input args on change', () => {
    const onChange = vi.fn()
    emitTextInputChange({ onChange }, { value: 'next' })
    expect(onChange).toHaveBeenCalledWith('next')
  })

  it('emits focus and blur', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    emitTextInputFocus({ onFocus })
    emitTextInputBlur({ onBlur })
    expect(onFocus).toHaveBeenCalledOnce()
    expect(onBlur).toHaveBeenCalledOnce()
  })

  it('translates field value, placeholder and htmlAttributes', () => {
    const setFieldValue = vi.fn()
    const props = textInputPropsFromField(
      { fieldName: 'name', placeholder: 'p', maxLength: 32 } as any,
      {
        getFieldValue: () => 'hi',
        setFieldValue,
        isFieldReadonly: () => false,
      },
    )
    expect(props.value).toBe('hi')
    expect(props.placeholder).toBe('p')
    expect(props.maxLength).toBe(32)
    expect(props.htmlAttributes).toEqual({ name: 'name', id: 'name' })
    props.onChange?.('x')
    expect(setFieldValue).toHaveBeenCalledWith(
      expect.objectContaining({ fieldName: 'name' }),
      'x',
    )
  })
})

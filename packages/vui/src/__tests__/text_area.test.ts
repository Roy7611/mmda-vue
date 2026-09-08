import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_TEXT_AREA_ROWS,
  emitTextAreaChange,
  textAreaAutoResizeOf,
  textAreaPropsFromField,
  textAreaResizeModeOf,
  textAreaRowsOf,
  textAreaValueOf,
} from '../ui/factory/text_area'

describe('textArea chrome helpers', () => {
  it('defaults value empty, rows 3, resizeMode Vertical', () => {
    expect(textAreaValueOf({})).toBe('')
    expect(textAreaRowsOf({})).toBe(DEFAULT_TEXT_AREA_ROWS)
    expect(textAreaResizeModeOf({})).toBe('Vertical')
  })

  it('reads value from value or modelValue', () => {
    expect(textAreaValueOf({ value: 'a' })).toBe('a')
    expect(textAreaValueOf({ modelValue: 'b' } as any)).toBe('b')
  })

  it('parses string rows', () => {
    expect(textAreaRowsOf({ rows: '5' as any })).toBe(5)
  })

  it('recognizes autoResize as entry leftover', () => {
    expect(textAreaAutoResizeOf({})).toBe(false)
    expect(textAreaAutoResizeOf({ autoResize: true } as any)).toBe(true)
  })

  it('unpacks EJ2 input args', () => {
    const onChange = vi.fn()
    emitTextAreaChange({ onChange }, { value: 'next' })
    expect(onChange).toHaveBeenCalledWith('next')
  })

  it('translates field value and maxLength', () => {
    const setFieldValue = vi.fn()
    const props = textAreaPropsFromField(
      { fieldName: 'remark', maxLength: 200, placeholder: 'p' } as any,
      {
        getFieldValue: () => 'hi',
        setFieldValue,
        isFieldReadonly: () => false,
      },
    )
    expect(props.value).toBe('hi')
    expect(props.maxLength).toBe(200)
    expect(props.placeholder).toBe('p')
    props.onChange?.('x')
    expect(setFieldValue).toHaveBeenCalledWith(
      expect.objectContaining({ fieldName: 'remark' }),
      'x',
    )
  })
})

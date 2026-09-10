import { describe, expect, it, vi } from 'vitest'
import { numberInputFormatOf, numberInputStepOf } from '@mmda/core'
import { emitNumberInputChange } from '@mmda/vui'

describe('number input chrome helpers', () => {
  it('defaults step to 1 for number and 0.01 for percent', () => {
    expect(numberInputStepOf({})).toBe(1)
    expect(numberInputStepOf({ kind: 'number' })).toBe(1)
    expect(numberInputStepOf({ kind: 'percent' })).toBe(0.01)
    expect(numberInputStepOf({ kind: 'percent', step: 0.5 })).toBe(0.5)
  })

  it('defaults format to n / p', () => {
    expect(numberInputFormatOf({})).toBe('n')
    expect(numberInputFormatOf({ kind: 'percent' })).toBe('p')
    expect(numberInputFormatOf({ kind: 'percent', format: 'p2' })).toBe('p2')
    expect(numberInputFormatOf({ format: 'c2' })).toBe('c2')
  })

  it('emits null and numbers through onChange / onUpdate', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const props = { onChange, onUpdate, 'onUpdate:modelValue': onUpdate }
    emitNumberInputChange(props, null)
    expect(onChange).toHaveBeenCalledWith(null)
    emitNumberInputChange(props, { value: 12.5 })
    expect(onChange).toHaveBeenCalledWith(12.5)
  })
})

import { describe, expect, it } from 'vitest'
import { progressBarPropsFromField } from '@mmda/core'

describe('progress bar chrome helpers', () => {
  it('maps empty field value to 0 and defaults kind via omit', () => {
    const props = progressBarPropsFromField(
      { fieldName: 'done' } as any,
      { getFieldValue: () => null } as any,
    )
    expect(props.value).toBe(0)
    expect(props.kind).toBeUndefined()
  })

  it('keeps a numeric field value on 0–100 scale', () => {
    const props = progressBarPropsFromField(
      { fieldName: 'done' } as any,
      { getFieldValue: () => 42 } as any,
      { kind: 'circular', size: 'small' },
    )
    expect(props.value).toBe(42)
    expect(props.kind).toBe('circular')
    expect(props.size).toBe('small')
  })
})

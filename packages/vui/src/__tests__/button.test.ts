import { describe, expect, it } from 'vitest'
import { buttonModifierClasses, selectButtonGroupSelected, selectButtonOptionLabel, selectButtonOptionValue, toggleSelectButtonGroupValue } from '@mmda/core'

describe('button chrome helpers', () => {
  it('maps colorRole to mmda-button hook', () => {
    expect(buttonModifierClasses({ colorRole: 'danger' })).toContain(
      'mmda-button--danger',
    )
  })

  it('reads option label/value', () => {
    const row = { name: 'Left', value: 'left' }
    expect(selectButtonOptionLabel(row, 'name')).toBe('Left')
    expect(selectButtonOptionValue(row, 'value')).toBe('left')
  })

  it('toggles multiple selection', () => {
    expect(selectButtonGroupSelected(['a'], 'a', 'multiple')).toBe(true)
    expect(toggleSelectButtonGroupValue(['a'], 'b', 'multiple')).toEqual([
      'a',
      'b',
    ])
    expect(toggleSelectButtonGroupValue(['a', 'b'], 'a', 'multiple')).toEqual([
      'b',
    ])
  })
})

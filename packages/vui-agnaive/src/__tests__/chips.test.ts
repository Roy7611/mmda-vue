import { describe, expect, it } from 'vitest'
import { naiveChipType } from '../factory/chips'

describe('naiveChipType', () => {
  it('maps colorRole to NTag type', () => {
    expect(naiveChipType('danger')).toBe('error')
    expect(naiveChipType('secondary')).toBe('default')
    expect(naiveChipType('success')).toBe('success')
  })
})

import { describe, expect, it } from 'vitest'
import { MOBILE_MASK, primeMaskOf } from '../ui/factory/masked_text_box'

describe('masked text box chrome helpers', () => {
  it('maps EJ2 digit mask to Prime 9', () => {
    expect(primeMaskOf(MOBILE_MASK)).toBe('999 9999 9999')
    expect(primeMaskOf('000000')).toBe('999999')
  })

  it('maps letters and keeps literals / escapes', () => {
    expect(primeMaskOf('LLL-000')).toBe('aaa-999')
    expect(primeMaskOf('\\A000')).toBe('A999')
  })
})

import { describe, expect, it } from 'vitest'
import { tooltipOpensOnToTrigger } from '../factory/tooltip'

describe('tooltip Naive maps', () => {
  it('maps opensOn to Naive trigger', () => {
    expect(tooltipOpensOnToTrigger('auto')).toBe('hover')
    expect(tooltipOpensOnToTrigger('custom')).toBe('manual')
    expect(tooltipOpensOnToTrigger('focus')).toBe('focus')
  })
})

import { describe, expect, it } from 'vitest'
import {
  tooltipOpensOnToEj2,
  tooltipPositionToEj2,
} from '../factory/tooltip'

describe('tooltip EJ2 maps', () => {
  it('maps position and opensOn to EJ2', () => {
    expect(tooltipPositionToEj2('top')).toBe('TopCenter')
    expect(tooltipPositionToEj2('bottom')).toBe('BottomCenter')
    expect(tooltipPositionToEj2('left')).toBe('LeftCenter')
    expect(tooltipPositionToEj2('right')).toBe('RightCenter')
    expect(tooltipOpensOnToEj2('auto')).toBe('Auto')
    expect(tooltipOpensOnToEj2('hover')).toBe('Hover')
    expect(tooltipOpensOnToEj2('custom')).toBe('Custom')
  })
})

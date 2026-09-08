import { describe, expect, it } from 'vitest'
import {
  tooltipContentOf,
  tooltipDisabledOf,
  tooltipModifierClasses,
  tooltipOpensOnOf,
  tooltipOpensOnToEj2,
  tooltipOpensOnToTrigger,
  tooltipPositionOf,
  tooltipPositionToEj2,
  tooltipShowPointerOf,
} from '../ui/factory/tooltip'

describe('tooltip helpers', () => {
  it('defaults position top and opensOn auto', () => {
    expect(tooltipPositionOf({})).toBe('top')
    expect(tooltipPositionOf({ position: 'left' })).toBe('left')
    expect(tooltipOpensOnOf({})).toBe('auto')
    expect(tooltipOpensOnOf({ opensOn: 'click' })).toBe('click')
  })

  it('maps position and opensOn to EJ2', () => {
    expect(tooltipPositionToEj2('top')).toBe('TopCenter')
    expect(tooltipPositionToEj2('bottom')).toBe('BottomCenter')
    expect(tooltipPositionToEj2('left')).toBe('LeftCenter')
    expect(tooltipPositionToEj2('right')).toBe('RightCenter')
    expect(tooltipOpensOnToEj2('auto')).toBe('Auto')
    expect(tooltipOpensOnToEj2('hover')).toBe('Hover')
    expect(tooltipOpensOnToEj2('custom')).toBe('Custom')
  })

  it('maps opensOn to naive/prime trigger', () => {
    expect(tooltipOpensOnToTrigger('auto')).toBe('hover')
    expect(tooltipOpensOnToTrigger('custom')).toBe('manual')
    expect(tooltipOpensOnToTrigger('focus')).toBe('focus')
  })

  it('reads content from props or content slot text', () => {
    expect(tooltipContentOf({ content: '说明' })).toBe('说明')
    expect(
      tooltipContentOf({}, {
        content: () => [{ children: '槽文案' } as any],
      }),
    ).toBe('槽文案')
  })

  it('showPointer defaults true; disabled is explicit', () => {
    expect(tooltipShowPointerOf({})).toBe(true)
    expect(tooltipShowPointerOf({ showPointer: false })).toBe(false)
    expect(tooltipDisabledOf({})).toBe(false)
    expect(tooltipDisabledOf({ disabled: true })).toBe(true)
  })

  it('adds position and disabled modifier classes', () => {
    const classes = tooltipModifierClasses({
      position: 'bottom',
      disabled: true,
    }).join(' ')
    expect(classes).toContain('mmda-tooltip--bottom')
    expect(classes).toContain('mmda-tooltip--disabled')
  })
})

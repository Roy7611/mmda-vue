import { describe, expect, it } from 'vitest'
import {
  tooltipContentOf,
  tooltipDisabledOf,
  tooltipModifierClasses,
  tooltipOpensOnOf,
  tooltipPositionOf,
  tooltipShowPointerOf,
} from '../ui/factory/tooltip'

describe('tooltip helpers', () => {
  it('defaults position top and opensOn auto', () => {
    expect(tooltipPositionOf({})).toBe('top')
    expect(tooltipPositionOf({ position: 'left' })).toBe('left')
    expect(tooltipOpensOnOf({})).toBe('auto')
    expect(tooltipOpensOnOf({ opensOn: 'click' })).toBe('click')
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

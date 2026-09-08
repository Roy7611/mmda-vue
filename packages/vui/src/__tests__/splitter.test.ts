import { describe, expect, it, vi } from 'vitest'
import {
  emitSplitterResize,
  splitterEnabledOf,
  splitterEventIndex,
  splitterModifierClasses,
  splitterOrientationOf,
  splitterReversePanesOf,
} from '../ui/factory/splitter'

describe('splitter chrome helpers', () => {
  it('defaults orientation Horizontal and enabled true', () => {
    expect(splitterOrientationOf({})).toBe('Horizontal')
    expect(splitterOrientationOf({ orientation: 'Vertical' })).toBe('Vertical')
    expect(splitterEnabledOf({})).toBe(true)
    expect(splitterEnabledOf({ enabled: false })).toBe(false)
  })

  it('adds reverse class', () => {
    expect(splitterReversePanesOf({ enableReversePanes: true })).toBe(true)
    const cls = splitterModifierClasses({
      orientation: 'Vertical',
      enableReversePanes: true,
    })
      .flat()
      .filter(Boolean)
      .join(' ')
    expect(cls).toContain('mmda-splitter')
    expect(cls).toContain('mmda-splitter--vertical')
    expect(cls).toContain('mmda-splitter--reverse')
  })

  it('reads EJ2 pair index', () => {
    expect(splitterEventIndex({ index: [0, 1] })).toBe(0)
    expect(splitterEventIndex({ index: 2 })).toBe(2)
  })

  it('emits resize stop', () => {
    const onResizeStop = vi.fn()
    emitSplitterResize({ onResizeStop }, 'stop', {
      index: [1, 2],
      paneSize: [40, 60],
    })
    expect(onResizeStop).toHaveBeenCalledWith({
      index: 1,
      paneSize: [40, 60],
    })
  })
})

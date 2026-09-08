import { describe, expect, it, vi } from 'vitest'
import {
  emitTabsChange,
  tabsHeaderPlacementOf,
  tabsHeightAdjustModeOf,
  tabsItemContentOf,
  tabsItemsOf,
  tabsModifierClasses,
  tabsOverflowModeOf,
  tabsScrollableOf,
  tabsValueOf,
} from '../ui/factory/tabs'

describe('tabs chrome helpers', () => {
  it('defaults value 0, placement Top, scrollable true, height Fill', () => {
    expect(tabsValueOf({})).toBe(0)
    expect(tabsHeaderPlacementOf({})).toBe('Top')
    expect(tabsScrollableOf({})).toBe(true)
    expect(tabsHeightAdjustModeOf({})).toBe('Fill')
    expect(tabsOverflowModeOf({})).toBe('Scrollable')
  })

  it('reads value from value or modelValue', () => {
    expect(tabsValueOf({ value: 2 })).toBe(2)
    expect(tabsValueOf({ modelValue: 3 } as any)).toBe(3)
  })

  it('normalizes string header to text', () => {
    const items = tabsItemsOf({
      items: [{ header: 'One', content: 'a' }],
    })
    expect(items[0]?.header).toEqual({ text: 'One', iconCss: undefined })
    expect(tabsItemContentOf(items[0]!)).toBe('a')
  })

  it('maps scrollable false to Popup overflow', () => {
    expect(tabsScrollableOf({ scrollable: false })).toBe(false)
    expect(tabsOverflowModeOf({ scrollable: false })).toBe('Popup')
  })

  it('adds placement overflow height classes', () => {
    const cls = tabsModifierClasses({
      headerPlacement: 'Left',
      scrollable: false,
      heightAdjustMode: 'Fill',
    })
      .flat()
      .filter(Boolean)
      .join(' ')
    expect(cls).toContain('mmda-tabs')
    expect(cls).toContain('mmda-tabs--left')
    expect(cls).toContain('mmda-tabs--popup')
    expect(cls).toContain('mmda-tabs--fill')
  })

  it('unpacks EJ2 selectedIndex and emits vui onChange', () => {
    const onChange = vi.fn()
    emitTabsChange({ onChange }, { selectedIndex: 1 })
    expect(onChange).toHaveBeenCalledWith(1)
  })
})

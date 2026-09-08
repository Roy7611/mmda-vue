import { describe, expect, it, vi } from 'vitest'
import {
  applyDrawerDefaults,
  DEFAULT_SIDEBAR_WIDTH,
  emitSidebarChange,
  sidebarEnableDockOf,
  sidebarEnableGesturesOf,
  sidebarIsOpenOf,
  sidebarModifierClasses,
  sidebarPositionOf,
  sidebarShowBackdropOf,
  sidebarTypeOf,
  sidebarWidthOf,
} from '../ui/factory/sidebar'

describe('sidebar chrome helpers', () => {
  it('defaults type Auto, position Left, width 280', () => {
    expect(sidebarTypeOf({})).toBe('Auto')
    expect(sidebarPositionOf({})).toBe('Left')
    expect(sidebarWidthOf({})).toBe(DEFAULT_SIDEBAR_WIDTH)
    expect(sidebarIsOpenOf({})).toBe(false)
  })

  it('reads isOpen from isOpen or modelValue', () => {
    expect(sidebarIsOpenOf({ isOpen: true })).toBe(true)
    expect(sidebarIsOpenOf({ modelValue: true } as any)).toBe(true)
  })

  it('drawer locks type Over and default backdrop', () => {
    expect(sidebarTypeOf({ type: 'Push' }, true)).toBe('Over')
    expect(sidebarShowBackdropOf({}, true)).toBe(true)
    expect(sidebarShowBackdropOf({}, false)).toBe(false)
    const drawer = applyDrawerDefaults({
      visible: true,
      type: 'Push',
      onUpdateVisible: vi.fn(),
    } as any)
    expect(drawer.type).toBe('Over')
    expect(drawer.isOpen).toBe(true)
    expect(drawer.showBackdrop).toBe(true)
  })

  it('adds dock and drawer classes', () => {
    const cls = sidebarModifierClasses({ enableDock: true }, true)
      .flat()
      .filter(Boolean)
      .join(' ')
    expect(cls).toContain('mmda-sidebar')
    expect(cls).toContain('mmda-sidebar--drawer')
    expect(cls).toContain('mmda-sidebar--over')
    expect(cls).toContain('mmda-sidebar--dock')
    expect(sidebarEnableDockOf({ enableDock: true })).toBe(true)
  })

  it('defaults enableGestures to true', () => {
    expect(sidebarEnableGesturesOf({})).toBe(true)
    expect(sidebarEnableGesturesOf({ enableGestures: false })).toBe(false)
  })

  it('emits vui onChange', () => {
    const onChange = vi.fn()
    emitSidebarChange({ onChange }, true)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

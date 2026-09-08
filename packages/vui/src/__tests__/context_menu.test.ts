import { describe, expect, it, vi } from 'vitest'
import {
  contextMenuItemsOf,
  contextMenuModifierClasses,
  findContextMenuItem,
  invokeContextMenuItem,
} from '../ui/factory/context_menu'

describe('contextMenu helpers', () => {
  it('filters invisible items and keeps dividers', () => {
    const items = contextMenuItemsOf({
      items: [
        { name: 'cut', label: '剪切' },
        { divider: true },
        { name: 'hidden', label: '隐藏', visible: false },
        { name: 'paste', label: '粘贴', canDo: false },
      ],
    })
    expect(items).toHaveLength(3)
    expect(items[0].label).toBe('剪切')
    expect(items[1].divider).toBe(true)
    expect(items[2].name).toBe('paste')
    expect(items[2].disabled).toBe(true)
  })

  it('adds mmda-context-menu class', () => {
    expect(contextMenuModifierClasses({}).join(' ')).toContain(
      'mmda-context-menu',
    )
  })

  it('invokes onAction then onSelect', () => {
    const onAction = vi.fn()
    const onSelect = vi.fn()
    const item = { name: 'cut', label: '剪切', onAction }
    invokeContextMenuItem({ onSelect }, item)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(item)
  })

  it('finds nested items', () => {
    const nested = { name: 'child', label: '子项' }
    const found = findContextMenuItem(
      [{ name: 'parent', label: '父', items: [nested] }],
      (item) => item.name === 'child',
    )
    expect(found).toBe(nested)
  })
})

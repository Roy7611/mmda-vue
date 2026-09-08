import { describe, expect, it } from 'vitest'
import {
  treeModifierClasses,
  treeSelectionModeOf,
} from '../ui/factory/tree'

describe('tree chrome helpers', () => {
  it('defaults selectionMode single without mode class', () => {
    expect(treeSelectionModeOf({})).toBe('single')
    const classes = treeModifierClasses({}).flat().filter(Boolean)
    expect(classes).toContain('mmda-tree')
    expect(classes).not.toContain('mmda-tree--checkbox')
    expect(classes).not.toContain('mmda-tree--none')
    expect(classes).not.toContain('mmda-tree--icons')
    expect(classes).not.toContain('mmda-tree--drag')
  })

  it('hooks checkbox, icons, and drag', () => {
    expect(treeSelectionModeOf({ selectionMode: 'checkbox' })).toBe('checkbox')
    expect(treeSelectionModeOf({ selectionMode: 'none' })).toBe('none')
    const classes = treeModifierClasses({
      selectionMode: 'checkbox',
      showIcon: true,
      allowDragDrop: true,
    })
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-tree--checkbox')
    expect(classes).toContain('mmda-tree--icons')
    expect(classes).toContain('mmda-tree--drag')
  })
})

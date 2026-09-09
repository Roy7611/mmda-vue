import { describe, expect, it } from 'vitest'
import {
  checkBoxListAllChecked,
  checkBoxListIndeterminate,
  checkBoxListKeysAfterSelectAll,
  checkBoxListKeysAfterToggle,
  checkBoxListModifierClasses,
} from '@mmda/core'

const options = [
  { value: 1, label: '读' },
  { value: 2, label: '写' },
]

describe('checkBoxList', () => {
  it('value_array 切换单项', () => {
    const props = {
      bindMode: 'value_array' as const,
      options,
      value: [1],
    }
    expect(checkBoxListKeysAfterToggle(props, options[1], true)).toEqual([1, 2])
    expect(checkBoxListKeysAfterToggle(props, options[0], false)).toEqual([])
  })

  it('全选开关与半选', () => {
    const partial = {
      bindMode: 'or_bits' as const,
      options,
      value: 1,
    }
    expect(checkBoxListIndeterminate(partial)).toBe(true)
    expect(checkBoxListAllChecked(partial)).toBe(false)
    expect(checkBoxListKeysAfterSelectAll(partial)).toEqual([1, 2])
    const all = { ...partial, value: 3 }
    expect(checkBoxListAllChecked(all)).toBe(true)
    expect(checkBoxListKeysAfterSelectAll(all)).toEqual([])
  })

  it('or_bits 钩子 class', () => {
    const cls = checkBoxListModifierClasses({
      bindMode: 'or_bits',
      options,
    })
      .flat()
      .join(' ')
    expect(cls).toContain('mmda-checkbox-list')
    expect(cls).toContain('mmda-checkbox-list--bits')
  })
})

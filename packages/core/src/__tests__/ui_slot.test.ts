import { describe, expect, it, vi } from 'vitest'
import { uiSlot, type UiSlot } from '../ui/slots'

describe('uiSlot：区域求值唯一出口', () => {
  it('有区域时用它的返回值', () => {
    const header: UiSlot<string> = () => 'H'
    expect(uiSlot(header)).toBe('H')
  })

  it('区域缺省时用 fallback', () => {
    expect(uiSlot(undefined, () => 'F')).toBe('F')
  })

  it('区域返回 null / undefined 时回退到 fallback（空区域语义一份）', () => {
    expect(uiSlot(() => null, () => 'F')).toBe('F')
    expect(uiSlot(() => undefined, () => 'F')).toBe('F')
  })

  it('两者都没有时给空数组（不是 undefined，控件可以直接当节点列表用）', () => {
    expect(uiSlot()).toEqual([])
    expect(uiSlot(undefined, () => null)).toEqual([])
  })

  it('多节点原样透传', () => {
    expect(uiSlot(() => ['a', 'b'])).toEqual(['a', 'b'])
  })

  it('惰性：调用 uiSlot 之前不建节点', () => {
    const slot = vi.fn(() => 'X')
    uiSlot(slot)
    expect(slot).toHaveBeenCalledTimes(1)
    // 没被求值时一次都不该调用
    const untouched = vi.fn(() => 'Y')
    expect(untouched).not.toHaveBeenCalled()
    expect(typeof untouched).toBe('function')
  })

  it('返回值是假值但非 nullish 时不算空（0 / 空串 / false 照用）', () => {
    expect(uiSlot<number | string>(() => 0, () => 'F')).toBe(0)
    expect(uiSlot(() => '', () => 'F')).toBe('')
  })
})

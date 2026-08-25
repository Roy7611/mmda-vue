// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  debounce,
  getNodePath,
  isSubsetByKey,
  mapTree,
  throttle,
  triggerEscKey,
} from '../utils/tools'

describe('mapTree', () => {
  it('叶子也会 mapper，空孩子键与参数一致', () => {
    const tree = { id: 1, items: [{ id: 2 }] }
    const out = mapTree(tree, (n) => ({ ...n, marked: true }), 'items')
    expect(out.marked).toBe(true)
    expect(out.items[0].marked).toBe(true)
    expect(out.items[0].items).toEqual([])
  })

  it('空根返回 null', () => {
    expect(mapTree(null, (n) => n)).toBeNull()
  })
})

describe('debounce / throttle', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounce 保留 this，并合并连续调用', () => {
    vi.useFakeTimers()
    const calls: number[] = []
    const obj = {
      id: 7,
      run: debounce(function (this: { id: number }, n: number) {
        calls.push(this.id + n)
      }, 40),
    }
    obj.run(1)
    obj.run(2)
    vi.advanceTimersByTime(39)
    expect(calls).toEqual([])
    vi.advanceTimersByTime(1)
    expect(calls).toEqual([9])
  })

  it('throttle 在窗口内只跑第一次', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const fn = vi.fn()
    const run = throttle(fn, 100)
    run('a')
    vi.setSystemTime(50)
    run('b')
    vi.setSystemTime(100)
    run('c')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn.mock.calls.map((c) => c[0])).toEqual(['a', 'c'])
  })
})

describe('树查询', () => {
  const tree = {
    id: '1',
    children: [
      { id: '2', children: [{ id: '3' }] },
      { id: '4' },
    ],
  }

  it('isSubsetByKey', () => {
    expect(isSubsetByKey([{ id: 1 }], [{ id: 1 }, { id: 2 }], 'id')).toBe(true)
    expect(isSubsetByKey([{ id: 3 }], [{ id: 1 }], 'id')).toBe(false)
    expect(isSubsetByKey([], [{ id: 1 }], 'id')).toBe(true)
  })

  it('getNodePath 从根到叶，找不到为空数组', () => {
    expect(getNodePath(tree, '3').map((n) => n.id)).toEqual(['1', '2', '3'])
    expect(getNodePath(tree, { id: '4' }).map((n) => n.id)).toEqual(['1', '4'])
    expect(getNodePath([tree], '3').map((n) => n.id)).toEqual(['1', '2', '3'])
    expect(getNodePath(tree, 'missing')).toEqual([])
  })
})

describe('triggerEscKey', () => {
  it('派发 keydown 并调用 callback', () => {
    const keys: string[] = []
    const onKey = (e: KeyboardEvent) => keys.push(e.key)
    document.addEventListener('keydown', onKey)
    const cb = vi.fn()
    triggerEscKey(cb)
    document.removeEventListener('keydown', onKey)
    expect(keys).toEqual(['Escape'])
    expect(cb).toHaveBeenCalledOnce()
  })
})

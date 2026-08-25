// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  LocalAsyncStorageDb,
  LocalStorageDb,
  useLocalAsyncDb,
} from '../utils/localdb'

describe('LocalStorageDb', () => {
  it('按 dbName/locale 隔离 key', () => {
    const zh = new LocalStorageDb('mmda-test', 'zh')
    const en = new LocalStorageDb('mmda-test', 'en')
    zh.put('k', '中')
    en.put('k', 'en')
    expect(zh.get('k')).toBe('中')
    expect(en.get('k')).toBe('en')
    zh.delete('k')
    expect(zh.get('k')).toBeNull()
    expect(en.get('k')).toBe('en')
    en.clear()
  })

  it('clear 只删本库前缀', () => {
    const db = new LocalStorageDb('mmda-test-clear')
    window.localStorage.setItem('foreign', 'keep')
    db.put('k', 'v')
    db.clear()
    expect(db.get('k')).toBeNull()
    expect(window.localStorage.getItem('foreign')).toBe('keep')
    window.localStorage.removeItem('foreign')
  })

  it('sessionOnly 写 sessionStorage', () => {
    const db = new LocalStorageDb('mmda-sess', 'zh', true)
    db.put('s', 1)
    expect(window.sessionStorage.getItem('mmda-sess/zh/s')).toBe('1')
    db.clear()
  })
})

describe('LocalAsyncStorageDb', () => {
  it('getMany / putMany / deleteMany', async () => {
    const db = new LocalAsyncStorageDb('mmda-async', 'zh')
    await db.putMany([
      ['a', 1],
      ['b', 2],
    ])
    expect(await db.getMany(['a', 'b', 'missing'])).toEqual([1, 2, null])
    await db.deleteMany(['a'])
    expect(await db.get('a')).toBeNull()
    expect(await db.get('b')).toBe(2)
    await db.clear()
  })
})

describe('useLocalAsyncDb', () => {
  it('对象可存，函数字段 JSON 化后丢失', async () => {
    const db = useLocalAsyncDb('mmda-idb-test', 'zh-Hans')
    await db.put('a', { a: 1, b: '2' })
    await db.put('m', {
      a: 4,
      m: () => 'method',
    })
    expect((await db.get('a')).b).toBe('2')
    expect((await db.get('m')).m).toBeUndefined()
    await db.delete('a')
    expect(await db.get('a')).toBeFalsy()
  })
})

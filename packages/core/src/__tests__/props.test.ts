import { describe, expect, it } from 'vitest'
import {
  addDefaultProp,
  addDefaultProps,
  addProp,
  getProp,
  hasProp,
  hasPropEx,
  ignoreNullishProps,
  selectProps,
} from '../index'

describe('UiProps bag', () => {
  it('hasProp treats null and undefined as missing', () => {
    expect(hasProp('a', { a: 0 })).toBe(true)
    expect(hasProp('a', { a: '' })).toBe(true)
    expect(hasProp('a', { a: null })).toBe(false)
    expect(hasProp('a', { a: undefined })).toBe(false)
    expect(hasProp('a', {})).toBe(false)
    expect(hasProp('a')).toBe(false)
  })

  it('getProp can remove the key', () => {
    const props = { a: 1, b: 2 }
    expect(getProp<number>('a', props)).toBe(1)
    expect(getProp<number>('a', props, true)).toBe(1)
    expect('a' in props).toBe(false)
    expect(hasPropEx('b', 2, props)).toBe(true)
  })

  it('addDefaultProp does not overwrite', () => {
    const props = addDefaultProp('size', 'small', { size: 'large' })
    expect(props.size).toBe('large')
    addDefaultProps({ size: 'tiny', color: 'red' }, props)
    expect(props.size).toBe('large')
    expect(props.color).toBe('red')
    addProp('size', 'medium', props)
    expect(props.size).toBe('medium')
  })

  it('selectProps skips nullish by default', () => {
    const src = { a: 1, b: null, c: 3 }
    expect(selectProps(src, ['a', 'b', 'c'])).toEqual({ a: 1, c: 3 })
    expect(selectProps(src, ['a', 'b'], false)).toEqual({ a: 1, b: null })
    expect(ignoreNullishProps({ a: 1, b: null, c: undefined })).toEqual({ a: 1 })
  })
})

import { describe, expect, it } from 'vitest'
import { avatarPropsFromField } from '../ui/factory/avatar'

const field = { fieldName: 'avatar' } as any

describe('avatarPropsFromField', () => {
  it('maps a URL to src and defaults to circle medium', () => {
    const props = avatarPropsFromField(field, {
      getFieldValue: () => '/faces/ada.png',
    })
    expect(props.src).toBe('/faces/ada.png')
    expect(props.icon).toBeUndefined()
    expect(props.shape).toBe('circle')
    expect(props.size).toBe('medium')
    expect(props.htmlAttributes).toEqual({ name: 'avatar', id: 'avatar' })
  })

  it('treats empty value as no image and falls back to user icon', () => {
    const props = avatarPropsFromField(field, {
      getFieldValue: () => '  ',
    })
    expect(props.src).toBeUndefined()
    expect(props.icon).toBe('fas fa-user')
  })

  it('字段 → props 只给 src / icon / 壳属性，不掺调用方的 size / colorRole', () => {
    const props = avatarPropsFromField(field, {
      getFieldValue: () => '/faces/roy.png',
    })
    expect(props.size).toBe('medium')
    expect(props.colorRole).toBeUndefined()
    expect(props.label).toBeUndefined()
    expect(Object.keys(props).sort()).toEqual([
      'htmlAttributes',
      'icon',
      'shape',
      'size',
      'src',
    ])
  })
})
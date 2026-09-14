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

  it('uses small size when a table row is present', () => {
    const props = avatarPropsFromField(
      field,
      { getFieldValue: (_f, row) => (row as { avatar?: string }).avatar },
      { row: { avatar: '/faces/roy.png' } },
    )
    expect(props.src).toBe('/faces/roy.png')
    expect(props.size).toBe('small')
  })

  it('lets extra override icon, label, size, and htmlAttributes', () => {
    const props = avatarPropsFromField(
      field,
      { getFieldValue: () => undefined },
      {
        icon: 'fas fa-user-tie',
        label: 'GR',
        size: 'large',
        colorRole: 'primary',
        htmlAttributes: { title: '职员' },
      },
    )
    expect(props.icon).toBe('fas fa-user-tie')
    expect(props.label).toBe('GR')
    expect(props.size).toBe('large')
    expect(props.colorRole).toBe('primary')
    expect(props.htmlAttributes).toEqual({
      name: 'avatar',
      id: 'avatar',
      title: '职员',
    })
  })
})

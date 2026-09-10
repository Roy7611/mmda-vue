import { describe, expect, it, vi } from 'vitest'
import { tagAutoCompleteAddItem, tagAutoCompleteItemsOf, tagAutoCompleteModifierClasses, tagAutoCompletePropsFromField, tagAutoCompleteTextOf } from '@mmda/core'

describe('tagAutoComplete', () => {
  it('join / split 逗号 tag', () => {
    expect(tagAutoCompleteItemsOf('a, b,,c')).toEqual(['a', 'b', 'c'])
    expect(tagAutoCompleteTextOf(['a', 'b'])).toBe('a,b')
  })

  it('输入后添加去重', () => {
    expect(tagAutoCompleteAddItem('a', 'b')).toEqual(['a', 'b'])
    expect(tagAutoCompleteAddItem('a', 'a')).toEqual(['a'])
  })

  it('propsFromField 写回 join 文本', () => {
    const field = { fieldName: 'tags', placeholder: '标签' } as any
    const setFieldValue = vi.fn()
    const props = tagAutoCompletePropsFromField(
      field,
      {
        getFieldValue: () => 'x,y',
        setFieldValue,
        isFieldReadonly: () => false,
      },
    )
    expect(props.value).toBe('x,y')
    props.onUpdate?.('x,y,z')
    expect(setFieldValue).toHaveBeenCalledWith(field, 'x,y,z')
    expect(tagAutoCompleteModifierClasses(props).join(' ')).toContain(
      'mmda-tag-autocomplete',
    )
  })
})

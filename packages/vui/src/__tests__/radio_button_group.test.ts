import { describe, expect, it, vi } from 'vitest'
import { MetaUiFieldRef } from '@mmda/core'
import {
  radioButtonGroupItemsOf,
  radioButtonGroupPropsFromField,
  radioButtonGroupValueOf,
} from '../ui/factory/radio_button_group'

describe('radioButtonGroup helpers', () => {
  it('maps empty field value to null and enum options via valueOf / labelOf', () => {
    const reference = MetaUiFieldRef.parse('0;LABOR;劳动力|1;CONSUMABLE;办公用品')!
    const field = { fieldName: 'kind', reference } as any
    const setFieldValue = vi.fn()
    const props = radioButtonGroupPropsFromField(field, {
      getFieldValue: () => null,
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.value).toBeNull()
    expect(props.options).toEqual([
      { value: 'LABOR', label: '劳动力' },
      { value: 'CONSUMABLE', label: '办公用品' },
    ])
    expect(props.name).toBe('kind')
    props.onChange?.('CONSUMABLE')
    expect(setFieldValue).toHaveBeenCalledWith(field, reference.refOptions[1])
  })

  it('maps ref options with valueOf / labelOf', () => {
    const reference = MetaUiFieldRef.parse('REF Status(id,name)')!
    reference.refOptions.push({ id: 'ok', name: '合格' }, { id: 'ng', name: '不合格' })
    const props = radioButtonGroupPropsFromField(
      { fieldName: 'status', reference } as any,
      {
        getFieldValue: () => 'ok',
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
      },
    )
    expect(props.value).toBe('ok')
    expect(props.options).toEqual([
      { value: 'ok', label: '合格' },
      { value: 'ng', label: '不合格' },
    ])
  })

  it('does not fill hasOne options without extra.options', () => {
    const hasOne = MetaUiFieldRef.parse('HAS_ONE Partner(id,name)')!
    hasOne.refOptions.push({ id: 'leak', name: '不该出现' })
    const props = radioButtonGroupPropsFromField(
      { fieldName: 'partner', reference: hasOne } as any,
      {
        getFieldValue: () => null,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
      },
    )
    expect(props.options).toEqual([])
  })

  it('parses chrome optionLabel / optionValue', () => {
    const items = radioButtonGroupItemsOf({
      options: [
        { id: 0, value: true, text: '合格' },
        { id: 1, value: false, text: '不合格' },
      ],
      optionLabel: 'text',
      optionValue: 'value',
    })
    expect(items).toEqual([
      { value: true, label: '合格' },
      { value: false, label: '不合格' },
    ])
  })

  it('prefers value over modelValue', () => {
    expect(radioButtonGroupValueOf({ value: 'a', modelValue: 'b' })).toBe('a')
    expect(radioButtonGroupValueOf({ modelValue: 'b' })).toBe('b')
    expect(radioButtonGroupValueOf({})).toBeUndefined()
  })
})

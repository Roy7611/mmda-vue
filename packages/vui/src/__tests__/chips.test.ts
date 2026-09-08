import { describe, expect, it, vi } from 'vitest'
import {
  bitChipSetPropsFromField,
  chipLabelsFromField,
  chipsKindOf,
  chipsPropsFromField,
  enumChipSetBindModeOf,
  enumChipSetPropsFromField,
  isChipsRemovable,
  naiveChipType,
  normalizeChipItem,
  syncfusionChipCssClass,
  toggleChipSelection,
} from '../ui/factory/chips'

const bitOptions = [
  { value: 1, label: '读' },
  { value: 2, label: '写' },
  { value: 0, label: '无' },
]

const bitField = {
  fieldName: 'ops',
  reference: {
    valueOf: (item: any) => item.value,
    labelOf: (item: any) => item.label,
    refOptions: bitOptions,
  },
} as any

describe('chips helpers', () => {
  it('normalizes string items', () => {
    expect(normalizeChipItem('原料')).toEqual({ label: '原料', value: '原料' })
  })

  it('defaults kind to action and treats input as removable', () => {
    expect(chipsKindOf({})).toBe('action')
    expect(isChipsRemovable({})).toBe(false)
    expect(isChipsRemovable({ kind: 'input' })).toBe(true)
    expect(isChipsRemovable({ removable: true })).toBe(true)
  })

  it('maps colorRole to EJ2 cssClass except secondary', () => {
    expect(syncfusionChipCssClass({ label: 'A', colorRole: 'success' })).toContain(
      'e-success',
    )
    expect(
      syncfusionChipCssClass({ label: 'A', colorRole: 'secondary' }),
    ).not.toContain('e-secondary')
    expect(
      syncfusionChipCssClass({ label: 'A', outlined: true }),
    ).toContain('e-outline')
  })

  it('maps Naive type', () => {
    expect(naiveChipType('danger')).toBe('error')
    expect(naiveChipType('secondary')).toBe('default')
    expect(naiveChipType('success')).toBe('success')
  })

  it('toggles filter selection', () => {
    const next = toggleChipSelection(
      { kind: 'filter', items: ['a', 'b'], selected: ['a'] },
      { label: 'b', value: 'b' },
      1,
    )
    expect(next).toEqual(['a', 'b'])
  })

  it('parses field labels from comma-separated text', () => {
    const labels = chipLabelsFromField(
      { fieldName: 'tags' } as any,
      { getFieldValue: () => '原料,辅料, 包装' },
    )
    expect(labels).toEqual(['原料', '辅料', '包装'])
    const props = chipsPropsFromField(
      { fieldName: 'tags' } as any,
      { getFieldValue: () => '原料,辅料' },
    )
    expect(props.items).toEqual(['原料', '辅料'])
    expect(props.kind).toBeUndefined()
  })

  it('does not treat a number as a bit mask for tags', () => {
    expect(
      chipLabelsFromField(
        {
          fieldName: 'ops',
          reference: {
            valueOf: (item: any) => item.value,
            labelOf: (item: any) => item.label,
            refOptions: bitOptions,
          },
        } as any,
        { getFieldValue: () => 3 },
      ),
    ).toEqual(['3'])
  })

  it('enumChipSet bindMode follows array vs join', () => {
    expect(enumChipSetBindModeOf(['a'])).toBe('value_array')
    expect(enumChipSetBindModeOf('a,b')).toBe('join_text')
    expect(enumChipSetBindModeOf('a', { bindMode: 'value_array' })).toBe(
      'value_array',
    )
  })

  it('bitChipSet lists all bits when editable and writes or_bits', () => {
    const setFieldValue = vi.fn()
    const props = bitChipSetPropsFromField(
      bitField,
      {
        getFieldValue: () => 1,
        setFieldValue,
        isFieldReadonly: () => false,
      },
    )
    expect(props.kind).toBe('filter')
    expect(props.items).toEqual([
      { label: '读', value: 1 },
      { label: '写', value: 2 },
    ])
    expect(props.selected).toEqual([1])
    props.onChange?.([1, 2])
    expect(setFieldValue).toHaveBeenCalledWith(bitField, 3)
  })

  it('bitChipSet readonly shows selected labels only', () => {
    const props = bitChipSetPropsFromField(
      bitField,
      {
        getFieldValue: () => 3,
        isFieldReadonly: () => true,
      },
    )
    expect(props.kind).toBe('action')
    expect(props.disabled).toBe(true)
    expect(props.items).toEqual([
      { label: '读', value: 1 },
      { label: '写', value: 2 },
    ])
    expect(props.onChange).toBeUndefined()
  })

  it('enumChipSet writes join_text from selected keys', () => {
    const field = {
      fieldName: 'kinds',
      reference: {
        valueOf: (item: any) => item.value,
        labelOf: (item: any) => item.label,
        refOptions: [
          { value: 'raw', label: '原料' },
          { value: 'pack', label: '包装' },
        ],
      },
    } as any
    const setFieldValue = vi.fn()
    const props = enumChipSetPropsFromField(field, {
      getFieldValue: () => 'raw',
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.selected).toEqual(['raw'])
    props.onChange?.(['raw', 'pack'])
    expect(setFieldValue).toHaveBeenCalledWith(field, 'raw,pack')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { EntityState, MetaModel, MetaUiFieldRef } from '@mmda/core'
import {
  applyMultiSelectSelection,
  multiSelectBoundOf,
  multiSelectItemsOf,
  multiSelectOptionKeyOf,
  multiSelectPropsFromField,
  multiSelectSelectedKeysOf,
} from '../ui/factory/multi_select'

const options = [
  { value: 1, label: '读' },
  { value: 2, label: '写' },
  { value: 4, label: '删' },
  { value: 0, label: '无' },
]

describe('multiSelect bindMode', () => {
  it('value_array 读写字段数组', () => {
    const props = { bindMode: 'value_array' as const, options }
    expect(multiSelectBoundOf([options[0], options[2]], props)).toEqual([1, 4])
    expect(multiSelectItemsOf([1, 4], props)).toEqual([options[0], options[2]])
  })

  it('join_text 用分隔符拼字符串', () => {
    const props = {
      bindMode: 'join_text' as const,
      options: [
        { value: 'a', label: '甲' },
        { value: 'b', label: '乙' },
      ],
    }
    expect(multiSelectBoundOf(props.options, props)).toBe('a,b')
    expect(multiSelectItemsOf('a,b', props)).toEqual(props.options)
  })

  it('or_bits 按选项数字 OR，跳过 0', () => {
    const props = { bindMode: 'or_bits' as const, options }
    expect(multiSelectBoundOf([options[0], options[1]], props)).toBe(3)
    expect(multiSelectItemsOf(3, props)).toEqual([options[0], options[1]])
    expect(multiSelectItemsOf(0, props)).toEqual([])
  })

  it('item_array 对实体子表同步 entityState', () => {
    const current = [
      {
        actionName: 'read',
        entityState: EntityState.DEFAULT,
        rowNum: '1',
      },
    ]
    const props = {
      bindMode: 'item_array' as const,
      valueField: 'actionName',
      labelField: 'displayLabel',
      value: current,
      options: [
        { actionName: 'read', displayLabel: '读' },
        { actionName: 'write', displayLabel: '写' },
      ],
    }
    const bound = applyMultiSelectSelection(props, [props.options[1]])
    expect(bound).toBe(current)
    expect(MetaModel.deleted(current[0])).toBe(true)
    expect(current[1].actionName).toBe('write')
    expect(MetaModel.created(current[1])).toBe(true)
  })

  it('optionKey 在非 bits 时走 reference.valueOf', () => {
    const reference = MetaUiFieldRef.parse('0;LABOR;劳动力|1;CONSUMABLE;办公用品')!
    expect(
      multiSelectOptionKeyOf(reference.refOptions[1], {
        reference,
        bindMode: 'value_array',
      }),
    ).toBe('CONSUMABLE')
  })

  it('propsFromField 预置 bindMode', () => {
    const field = { fieldName: 'flags', displayLabel: '标志' } as any
    const setFieldValue = vi.fn()
    const props = multiSelectPropsFromField(
      field,
      {
        getFieldValue: () => 0,
        setFieldValue,
        isFieldReadonly: () => false,
      },
      { bindMode: 'or_bits', options },
    )
    expect(props.bindMode).toBe('or_bits')
    props.onChange?.(3)
    expect(setFieldValue).toHaveBeenCalledWith(field, 3)
  })

  it('selectedKeys 忽略已删子行', () => {
    const props = {
      bindMode: 'item_array' as const,
      valueField: 'actionName',
      value: [
        { actionName: 'read', entityState: EntityState.DELETED },
        { actionName: 'write', entityState: EntityState.DEFAULT },
      ],
    }
    expect(multiSelectSelectedKeysOf(props)).toEqual(['write'])
  })
})

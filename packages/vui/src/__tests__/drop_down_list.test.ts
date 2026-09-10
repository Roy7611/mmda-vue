import { describe, expect, it, vi } from 'vitest'
import { MetaOptionsShape, MetaUiFieldRef } from '@mmda/core'
import { dropDownListModifierClasses, dropDownListPropsFromField, dropDownListValueOf, nestSelectOptionsByGroup, normalizeSelectOption, selectOptionFromSource, selectOptionsOf } from '@mmda/core'
import { emitDropDownListChange } from '@mmda/vui'
import { comboBoxAllowCustom, comboBoxModifierClasses, comboBoxPropsFromField } from '@mmda/core'

describe('dropDownList helpers', () => {
  it('normalizes string and object options with group and icon', () => {
    expect(normalizeSelectOption('A')).toEqual({ value: 'A', label: 'A' })
    expect(
      normalizeSelectOption({
        value: 'B',
        label: '乙',
        group: '中',
        icon: 'flag',
      }),
    ).toEqual({ value: 'B', label: '乙', group: '中', icon: 'flag' })
  })

  it('nests options by group in first-seen order', () => {
    const nested = nestSelectOptionsByGroup(
      selectOptionsOf({
        options: [
          { value: 1, label: '一', group: 'G1' },
          { value: 2, label: '二', group: 'G2' },
          { value: 3, label: '三', group: 'G1' },
        ],
      }),
    )
    expect(nested.map((g) => g.label)).toEqual(['G1', 'G2'])
    expect(nested[0].options.map((o) => o.value)).toEqual([1, 3])
  })

  it('prefers value over modelValue', () => {
    expect(dropDownListValueOf({ value: 'a', modelValue: 'b' })).toBe('a')
    expect(dropDownListValueOf({ modelValue: 'b' })).toBe('b')
    expect(dropDownListValueOf({})).toBeUndefined()
  })

  it('emits onChange and v-model', () => {
    const onChange = vi.fn()
    const onModel = vi.fn()
    emitDropDownListChange({ onChange, 'onUpdate:modelValue': onModel }, 'x')
    expect(onChange).toHaveBeenCalledWith('x')
    expect(onModel).toHaveBeenCalledWith('x')
  })

  it('adds root hook class', () => {
    expect(dropDownListModifierClasses({}).join(' ')).toContain(
      'mmda-dropdown-list',
    )
  })

  it('maps enum refOptions with valueOf / labelOf', () => {
    const reference = MetaUiFieldRef.parse('0;LABOR;劳动力|1;CONSUMABLE;办公用品')!
    const field = {
      fieldName: 'kind',
      displayLabel: '种类',
      placeholder: '选',
      reference,
    } as any
    const setFieldValue = vi.fn()
    const props = dropDownListPropsFromField(field, {
      getFieldValue: () => 'LABOR',
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.value).toBe('LABOR')
    expect(props.options).toEqual([
      { value: 'LABOR', label: '劳动力' },
      { value: 'CONSUMABLE', label: '办公用品' },
    ])
    expect(props.placeholder).toBe('选')
    expect(props.htmlAttributes).toMatchObject({ name: 'kind', id: 'kind' })
    props.onChange?.('CONSUMABLE')
    expect(setFieldValue).toHaveBeenCalledWith(field, reference.refOptions[1])
  })

  it('writes GROUP BY as option.group and skips extra ref columns', () => {
    const grouped = MetaUiFieldRef.parse(
      'REF Category(id,name) GROUP BY kind',
    )!
    grouped.refOptions.push(
      { id: '1', name: 'A', kind: '原料' },
      { id: '2', name: 'B', kind: '辅料' },
    )
    expect(grouped.refOptionsShape).toBe(MetaOptionsShape.GROUPED)
    const props = dropDownListPropsFromField(
      { fieldName: 'cat', reference: grouped } as any,
      {
        getFieldValue: () => null,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
      },
    )
    expect(props.options).toEqual([
      { value: '1', label: 'A', group: '原料' },
      { value: '2', label: 'B', group: '辅料' },
    ])

    const extraCols = MetaUiFieldRef.parse('REF Category(id,name,kind)')!
    extraCols.refOptions.push({ id: '1', name: 'A', kind: '原料' })
    const flat = dropDownListPropsFromField(
      { fieldName: 'cat', reference: extraCols } as any,
      {
        getFieldValue: () => null,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
      },
    )
    expect(flat.options?.[0]).toEqual({ value: '1', label: 'A 原料' })
    const first = flat.options?.[0]
    expect(typeof first === 'object' && first ? first.group : undefined).toBeUndefined()
  })

  it('copies icon from option rows', () => {
    expect(
      selectOptionFromSource({ value: 'a', label: 'A', icon: 'star' }),
    ).toEqual({ value: 'a', label: 'A', icon: 'star' })
  })

  it('does not fill hasOne refOptions; wires searchRelative as suggest', async () => {
    const hasOne = MetaUiFieldRef.parse('HAS_ONE Partner(id,name)')!
    hasOne.refOptions.push({ id: 'leak', name: '不该出现' })
    const searchRelative = vi.fn(async () => ({
      selectOptions: [{ id: 'P1', name: '甲' }],
    }))
    const props = dropDownListPropsFromField(
      { fieldName: 'partner', reference: hasOne } as any,
      {
        getFieldValue: () => null,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
        searchRelative,
      },
    )
    expect(props.options).toEqual([])
    expect(props.suggest).toBeTypeOf('function')
    await expect(props.suggest?.('甲')).resolves.toEqual([
      { value: 'P1', label: '甲' },
    ])
    expect(searchRelative).toHaveBeenCalled()
  })
})

describe('comboBox helpers', () => {
  it('adds custom hook class unless allowCustom is false', () => {
    expect(comboBoxModifierClasses({}).join(' ')).toContain('mmda-combobox')
    expect(comboBoxModifierClasses({}).join(' ')).toContain(
      'mmda-combobox--custom',
    )
    expect(comboBoxAllowCustom({})).toBe(true)
    expect(
      comboBoxModifierClasses({ allowCustom: false }).join(' '),
    ).not.toContain('mmda-combobox--custom')
  })

  it('reuses field mapping and passes allowCustom', () => {
    const reference = MetaUiFieldRef.parse('0;A;甲|1;B;乙')!
    const props = comboBoxPropsFromField(
      { fieldName: 'k', reference } as any,
      {
        getFieldValue: () => 'A',
        setFieldValue: vi.fn(),
        isFieldReadonly: () => false,
      },
      { allowCustom: false },
    )
    expect(props.value).toBe('A')
    expect(props.options?.[0]).toEqual({ value: 'A', label: '甲' })
    expect(props.allowCustom).toBe(false)
  })
})

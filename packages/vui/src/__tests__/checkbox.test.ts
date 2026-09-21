import { describe, expect, it, vi } from 'vitest'
import { checkBoxCheckedOf, checkBoxModifierClasses, checkBoxPropsFromField } from '@mmda/core'
import { emitCheckBoxChange } from '@mmda/vui'

describe('checkBox helpers', () => {
  it('reads checked, empty means false', () => {
    expect(checkBoxCheckedOf({ checked: true })).toBe(true)
    expect(checkBoxCheckedOf({ checked: false })).toBe(false)
    expect(checkBoxCheckedOf({})).toBe(false)
  })

  it('emits onChange, onUpdate:modelValue, and onUpdate', () => {
    const onChange = vi.fn()
    const onModel = vi.fn()
    const onUpdate = vi.fn()
    emitCheckBoxChange(
      {
        onChange,
        'onUpdate:modelValue': onModel,
        onUpdate,
      },
      true,
    )
    expect(onChange).toHaveBeenCalledWith(true)
    expect(onModel).toHaveBeenCalledWith(true)
    expect(onUpdate).toHaveBeenCalledWith(true)
  })

  it('adds indeterminate hook class only when true', () => {
    expect(checkBoxModifierClasses({}).join(' ')).toContain('mmda-checkbox')
    expect(checkBoxModifierClasses({}).join(' ')).not.toContain(
      'mmda-checkbox--indeterminate',
    )
    expect(
      checkBoxModifierClasses({ indeterminate: true }).join(' '),
    ).toContain('mmda-checkbox--indeterminate')
  })

  it('translates field displayLabel and getFieldValue', () => {
    const field = { fieldName: 'active', displayLabel: '启用' } as any
    const setFieldValue = vi.fn()
    const props = checkBoxPropsFromField(field, {
      getFieldValue: () => true,
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.checked).toBe(true)
    expect(props.label).toBe('启用')
    expect(props.disabled).toBe(false)
    expect(props.htmlAttributes).toMatchObject({ name: 'active', id: 'active' })
    props.onChange?.(false)
    expect(setFieldValue).toHaveBeenCalledWith(field, false)
  })

  it('无入参 label 时用字段 displayLabel', () => {
    const props = checkBoxPropsFromField(
      { fieldName: 'ok', displayLabel: '同意' } as any,
      {
        getFieldValue: () => false,
        setFieldValue: vi.fn(),
        isFieldReadonly: () => true,
      },
    )
    expect(props.label).toBe('同意')
    expect(props.disabled).toBe(true)
  })
})

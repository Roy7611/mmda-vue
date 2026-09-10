import { describe, expect, it, vi } from 'vitest'
import { switchCheckedOf, switchModifierClasses, switchPropsFromField } from '@mmda/core'
import { emitSwitchChange } from '@mmda/vui'

describe('switch chrome helpers', () => {
  it('prefers checked over modelValue', () => {
    expect(switchCheckedOf({ checked: true, modelValue: false })).toBe(true)
    expect(switchCheckedOf({ modelValue: true })).toBe(true)
    expect(switchCheckedOf({})).toBe(false)
  })

  it('emits onChange and model updates; hooks checked class', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const onModel = vi.fn()
    emitSwitchChange(
      {
        onChange,
        onUpdate,
        'onUpdate:modelValue': onModel,
      },
      true,
    )
    expect(onChange).toHaveBeenCalledWith(true)
    expect(onUpdate).toHaveBeenCalledWith(true)
    expect(onModel).toHaveBeenCalledWith(true)
    const classes = switchModifierClasses({ checked: true, disabled: true })
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-switch')
    expect(classes).toContain('mmda-switch--checked')
    expect(classes).toContain('mmda-switch--disabled')
  })

  it('translates field getFieldValue into checked', () => {
    const field = { fieldName: 'active' } as any
    const setFieldValue = vi.fn()
    const props = switchPropsFromField(field, {
      getFieldValue: () => true,
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.checked).toBe(true)
    props.onChange?.(false)
    expect(setFieldValue).toHaveBeenCalledWith(field, false)
  })
})

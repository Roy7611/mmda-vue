import { describe, expect, it, vi } from 'vitest'
import {
  emitSwitchChange,
  switchArgs,
  switchCheckedOf,
  switchModifierClasses,
  switchPropsFromField,
} from '../ui/factory/switch'

describe('switch chrome helpers', () => {
  it('merges (value, props) and prefers checked over modelValue', () => {
    expect(switchArgs(true, { disabled: true }).checked).toBe(true)
    expect(switchArgs(true, { disabled: true }).disabled).toBe(true)
    expect(switchArgs({ checked: true, onLabel: '开' }).onLabel).toBe('开')
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

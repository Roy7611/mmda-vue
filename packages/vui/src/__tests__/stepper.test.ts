import { describe, expect, it, vi } from 'vitest'
import {
  emitStepperChange,
  stepperDisplayToEj2,
  stepperIndexOf,
  stepperItemsOf,
  stepperModifierClasses,
  stepperOrientationToEj2,
  stepperPropsFromField,
  stepperStatusToEj2,
  stepperValueOf,
} from '../ui/factory/stepper'

describe('stepper helpers', () => {
  it('reads index from value over modelValue', () => {
    expect(stepperIndexOf(null)).toBe(0)
    expect(stepperValueOf({ value: 2, modelValue: 0 })).toBe(2)
    expect(stepperValueOf({ modelValue: 1 })).toBe(1)
    expect(stepperValueOf({})).toBe(0)
  })

  it('maps vui enums to EJ2 PascalCase', () => {
    expect(stepperOrientationToEj2('vertical')).toBe('Vertical')
    expect(stepperDisplayToEj2('indicator')).toBe('Indicator')
    expect(stepperStatusToEj2('completed')).toBe('Completed')
  })

  it('emits onChange and v-model', () => {
    const onChange = vi.fn()
    const onModel = vi.fn()
    emitStepperChange({ onChange, 'onUpdate:modelValue': onModel }, 3)
    expect(onChange).toHaveBeenCalledWith(3)
    expect(onModel).toHaveBeenCalledWith(3)
  })

  it('adds orientation and linear hook classes', () => {
    expect(stepperModifierClasses({}).join(' ')).toContain('mmda-stepper--horizontal')
    expect(stepperModifierClasses({ orientation: 'vertical' }).join(' ')).toContain(
      'mmda-stepper--vertical',
    )
    expect(stepperModifierClasses({ linear: true }).join(' ')).toContain('mmda-stepper--linear')
  })

  it('reads default item keys when *Field omitted', () => {
    expect(
      stepperItemsOf({
        items: [{ label: '甲', icon: 'edit', status: 'completed' }],
      }),
    ).toEqual([
      {
        key: undefined,
        label: '甲',
        text: undefined,
        icon: 'edit',
        optional: undefined,
        disabled: undefined,
        valid: undefined,
        status: 'completed',
        cssClass: undefined,
      },
    ])
  })

  it('binds label/text/icon/status from field names or functions', () => {
    const rows = [
      { phaseName: '填写', remark: '第一步', iconCss: 'edit', done: false },
      { phaseName: '完成', remark: '', iconCss: 'check', done: true },
    ]
    expect(
      stepperItemsOf({
        items: rows,
        labelField: 'phaseName',
        textField: (row) => row.remark || undefined,
        iconField: 'iconCss',
        statusField: (row) => (row.done ? 'completed' : 'inProgress'),
      }),
    ).toEqual([
      {
        key: undefined,
        label: '填写',
        text: '第一步',
        icon: 'edit',
        optional: undefined,
        disabled: undefined,
        valid: undefined,
        status: 'inProgress',
        cssClass: undefined,
      },
      {
        key: undefined,
        label: '完成',
        text: undefined,
        icon: 'check',
        optional: undefined,
        disabled: undefined,
        valid: undefined,
        status: 'completed',
        cssClass: undefined,
      },
    ])
  })

  it('translates field integer and extra items', () => {
    const field = { fieldName: 'phase' } as any
    const setFieldValue = vi.fn()
    const items = [{ label: '甲' }, { label: '乙' }]
    const props = stepperPropsFromField(
      field,
      {
        getFieldValue: () => 1,
        setFieldValue,
        isFieldReadonly: () => true,
      },
      { items, orientation: 'vertical', labelField: 'label' },
    )
    expect(props.value).toBe(1)
    expect(props.items).toEqual(items)
    expect(props.labelField).toBe('label')
    expect(props.readOnly).toBe(true)
    expect(props.orientation).toBe('vertical')
    props.onChange?.(2)
    expect(setFieldValue).toHaveBeenCalledWith(field, 2)
  })
})

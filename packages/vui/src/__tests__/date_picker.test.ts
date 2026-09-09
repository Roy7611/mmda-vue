import { describe, expect, it, vi } from 'vitest'
import {
  DATE_PICKER_FIRST_DAY_OF_WEEK,
  dateOf,
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFirstDayOfWeek,
  datePickerFormatOf,
  datePickerMinOf,
  datePickerModifierClasses,
  datePickerNaiveFirstDayOfWeek,
  datePickerNaiveFormat,
  datePickerPrimeFormat,
  datePickerPropsFromField,
  emitDateChange,
  monthPickerPropsFromField,
  resolveDateShortcutValue,
  resolveDateShortcuts,
} from '../ui/factory/date_picker'
import { dateRangePickerValueOf } from '@mmda/core'

describe('datePicker helpers', () => {
  it('parses Date and prefers value over modelValue', () => {
    const day = new Date(2026, 8, 7)
    expect(dateOf(day)?.getTime()).toBe(day.getTime())
    expect(datePickerDateOf({ value: day, modelValue: new Date(0) })?.getTime()).toBe(
      day.getTime(),
    )
    expect(datePickerDateOf({ modelValue: '2026-09-07' })?.getFullYear()).toBe(2026)
    expect(datePickerDateOf({})).toBeUndefined()
  })

  it('reads minDate leftover and default firstDayOfWeek Monday', () => {
    const min = new Date(2026, 0, 1)
    expect(datePickerMinOf({ minDate: min })?.getTime()).toBe(min.getTime())
    expect(datePickerFirstDayOfWeek({})).toBe(DATE_PICKER_FIRST_DAY_OF_WEEK)
    expect(datePickerFirstDayOfWeek({ firstDayOfWeek: 0 })).toBe(0)
  })

  it('defaults allowInput to false and maps MES manualInput', () => {
    expect(datePickerAllowInput({})).toBe(false)
    expect(datePickerAllowInput({ allowInput: true })).toBe(true)
    expect(datePickerAllowInput({ manualInput: true })).toBe(true)
  })

  it('uses month format when precision is month', () => {
    expect(datePickerFormatOf({})).toBe('yyyy-MM-dd')
    expect(datePickerFormatOf({ precision: 'month' })).toBe('yyyy-MM')
    expect(datePickerPrimeFormat('yyyy-MM-dd')).toBe('yy-mm-dd')
    expect(datePickerNaiveFormat('yyyy-MM-dd')).toBe('YYYY-MM-DD')
    expect(datePickerNaiveFirstDayOfWeek(1)).toBe(0)
  })

  it('emits onChange, v-model, and leftover onUpdatePicker', () => {
    const onChange = vi.fn()
    const onModel = vi.fn()
    const onPicker = vi.fn()
    const day = new Date(2026, 8, 7)
    emitDateChange(
      { onChange, 'onUpdate:modelValue': onModel, onUpdatePicker: onPicker },
      day,
    )
    expect(onChange).toHaveBeenCalledWith(day)
    expect(onModel).toHaveBeenCalledWith(day)
    expect(onPicker).toHaveBeenCalledWith(day)
  })

  it('adds month hook class', () => {
    expect(datePickerModifierClasses({}).join(' ')).toContain('mmda-datepicker')
    expect(
      datePickerModifierClasses({ precision: 'month' }).join(' '),
    ).toContain('mmda-datepicker--month')
  })

  it('built-in shortcuts are today/yesterday only; custom appends', () => {
    const off = resolveDateShortcuts('day', {})
    expect(off).toEqual([])
    const builtin = resolveDateShortcuts('day', { showShortcuts: true })
    expect(builtin.map((item) => item.label)).toEqual(['今天', '昨天'])
    const mixed = resolveDateShortcuts('day', {
      showShortcuts: true,
      shortcuts: [{ label: '上周日', value: new Date(2026, 8, 6) }],
    })
    expect(mixed.map((item) => item.label)).toEqual(['今天', '昨天', '上周日'])
    const customOnly = resolveDateShortcuts('day', {
      shortcuts: [{ label: '上周日', value: () => new Date(2026, 8, 6) }],
    })
    expect(customOnly.map((item) => item.label)).toEqual(['上周日'])
    const resolved = resolveDateShortcutValue(customOnly[0])
    expect(resolved instanceof Date).toBe(true)
  })

  it('range value is a two-date tuple', () => {
    const start = new Date(2026, 8, 1)
    const end = new Date(2026, 8, 7)
    expect(dateRangePickerValueOf({ value: [start, end] })).toEqual([start, end])
    expect(dateRangePickerValueOf({ value: null })).toBeNull()
  })

  it('translates field value and month precision', () => {
    const field = { fieldName: 'due', displayLabel: '到期', nullable: true } as any
    const setFieldValue = vi.fn()
    const day = new Date(2026, 8, 7)
    const props = datePickerPropsFromField(field, {
      getFieldValue: () => day,
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(props.value?.getTime()).toBe(day.getTime())
    expect(props.showClear).toBe(true)
    expect(props.allowInput).toBe(false)
    props.onChange?.(day)
    expect(setFieldValue).toHaveBeenCalledWith(field, day)
    const month = monthPickerPropsFromField(field, {
      getFieldValue: () => day,
      setFieldValue,
      isFieldReadonly: () => false,
    })
    expect(month.precision).toBe('month')
    expect(month.format).toBe('yyyy-MM')
  })
})

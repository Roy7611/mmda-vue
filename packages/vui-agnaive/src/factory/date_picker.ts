import { h } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { UiDatePickerProps, UiDateShortcut, UiDateShortcutKind } from '@mmda/core'
import { datePickerAllowInput, datePickerDateOf, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerModifierClasses, datePickerShowClear, emitDateBlur, emitDateClear, emitDateFocus, resolveDateShortcutValue, resolveDateShortcuts } from '@mmda/core'
import { emitDateChange } from '@mmda/vui'
import { datePickerNaiveFirstDayOfWeek, datePickerNaiveFormat, htmlAttributesOf } from '@mmda/vui'

function toTs(value: Date | null | undefined): number | null {
  if (!value) return null
  const time = value.getTime()
  return Number.isNaN(time) ? null : time
}

function fromTs(value: number | null | undefined): Date | null {
  if (value == null) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function naiveDateShortcuts(
  kind: UiDateShortcutKind,
  props: { showShortcuts?: boolean; shortcuts?: UiDateShortcut[] },
) {
  const items = resolveDateShortcuts(kind, props)
  if (!items.length) return undefined
  const record: Record<string, () => number | [number, number] | null> = {}
  for (const item of items) {
    record[item.label] = () => {
      const value = resolveDateShortcutValue(item)
      if (value == null) return null
      if (Array.isArray(value)) return [value[0].getTime(), value[1].getTime()]
      return value.getTime()
    }
  }
  return record
}

export function createDatePicker(props: UiDatePickerProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    min: _min,
    max: _max,
    minDate: _minDate,
    maxDate: _maxDate,
    format,
    placeholder,
    disabled,
    allowInput: _allowInput,
    allowEdit: _allowEdit,
    manualInput: _manualInput,
    showClear,
    openOnFocus: _openOnFocus,
    inputFormats: _inputFormats,
    readonly,
    showShortcuts: _showShortcuts,
    shortcuts: _shortcuts,
    firstDayOfWeek: _firstDayOfWeek,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    precision,
    enabled: _enabled,
    strictMode: _strictMode,
    showTodayButton: _showTodayButton,
    selectionMode: _selectionMode,
    ...rest
  } = props

  const month = precision === 'month'
  const min = datePickerMinOf(props)
  const max = datePickerMaxOf(props)

  return h(NDatePicker as any, {
    ...rest,
    ...htmlAttributesOf(props),
    type: month ? 'month' : 'date',
    value: toTs(datePickerDateOf(props) ?? null),
    'onUpdate:value': (next: number | null) => emitDateChange(props, fromTs(next)),
    format: datePickerNaiveFormat(datePickerFormatOf(props)),
    placeholder,
    disabled,
    readonly: readonly === true,
    inputReadonly: !datePickerAllowInput(props),
    clearable: datePickerShowClear(props),
    firstDayOfWeek: datePickerNaiveFirstDayOfWeek(datePickerFirstDayOfWeek(props)),
    isDateDisabled: (ts: number) => {
      const date = fromTs(ts)
      if (!date) return false
      if (min && date.getTime() < min.getTime()) return true
      if (max && date.getTime() > max.getTime()) return true
      return false
    },
    shortcuts: naiveDateShortcuts(month ? 'month' : 'day', props),
    class: [...datePickerModifierClasses(props)].flat(),
    onClear: () => {
      emitDateClear(props)
      emitDateChange(props, null)
    },
    onFocus: () => emitDateFocus(props),
    onBlur: () => emitDateBlur(props),
  })
}

export { toTs, fromTs }

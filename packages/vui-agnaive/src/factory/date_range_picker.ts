import { h } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { UiDateRangePickerProps } from '@mmda/core'
import { dateRangePickerModifierClasses, dateRangePickerSeparatorOf, dateRangePickerValueOf } from '@mmda/core'
import { DATE_RANGE_PICKER_FORMAT, datePickerAllowInput, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerShowClear, emitDateBlur, emitDateClear, emitDateFocus } from '@mmda/core'
import { emitDateChange } from '@mmda/vui'
import { datePickerNaiveFirstDayOfWeek, datePickerNaiveFormat, htmlAttributesOf } from '@mmda/vui'
import { fromTs, naiveDateShortcuts, toTs } from './date_picker'

export function createDateRangePicker(props: UiDateRangePickerProps) {
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
    separator: _separator,
    minDays: _minDays,
    maxDays: _maxDays,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    enabled: _enabled,
    strictMode: _strictMode,
    showTodayButton: _showTodayButton,
    ...rest
  } = props

  const bound = dateRangePickerValueOf(props)
  const model =
    bound == null ? null : ([toTs(bound[0]), toTs(bound[1])] as [number, number])

  return h(NDatePicker as any, {
    ...rest,
    ...htmlAttributesOf(props),
    type: 'daterange',
    value: model,
    'onUpdate:value': (next: [number, number] | null) => {
      if (!next || next[0] == null || next[1] == null) {
        emitDateChange(props, null)
        return
      }
      const start = fromTs(next[0])
      const end = fromTs(next[1])
      emitDateChange(props, start && end ? [start, end] : null)
    },
    format: datePickerNaiveFormat(
      datePickerFormatOf(props, DATE_RANGE_PICKER_FORMAT),
    ),
    separator: dateRangePickerSeparatorOf(props),
    placeholder,
    disabled,
    readonly: readonly === true,
    inputReadonly: !datePickerAllowInput(props),
    clearable: datePickerShowClear(props),
    firstDayOfWeek: datePickerNaiveFirstDayOfWeek(datePickerFirstDayOfWeek(props)),
    shortcuts: naiveDateShortcuts('range', props),
    class: [...dateRangePickerModifierClasses(props)].flat(),
    onClear: () => {
      emitDateClear(props)
      emitDateChange(props, null)
    },
    onFocus: () => emitDateFocus(props),
    onBlur: () => emitDateBlur(props),
  })
}

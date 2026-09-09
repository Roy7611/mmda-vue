import { h } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { UiDateTimePickerProps } from '@mmda/core'
import { dateTimePickerModifierClasses, dateTimePickerStepOf } from '@mmda/core'
import { DATE_TIME_PICKER_FORMAT, datePickerAllowInput, datePickerDateOf, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerShowClear, emitDateBlur, emitDateChange, emitDateClear, emitDateFocus } from '@mmda/core'
import { datePickerNaiveFirstDayOfWeek, datePickerNaiveFormat, htmlAttributesOf } from '@mmda/vui'
import { fromTs, naiveDateShortcuts, toTs } from './date_picker'

export function createDateTimePicker(props: UiDateTimePickerProps) {
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
    step: _step,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    enabled: _enabled,
    strictMode: _strictMode,
    showTodayButton: _showTodayButton,
    ...rest
  } = props

  return h(NDatePicker as any, {
    ...rest,
    ...htmlAttributesOf(props),
    type: 'datetime',
    value: toTs(datePickerDateOf(props) ?? null),
    'onUpdate:value': (next: number | null) => emitDateChange(props, fromTs(next)),
    format: datePickerNaiveFormat(
      datePickerFormatOf(props, DATE_TIME_PICKER_FORMAT),
    ),
    placeholder,
    disabled,
    readonly: readonly === true,
    inputReadonly: !datePickerAllowInput(props),
    clearable: datePickerShowClear(props),
    firstDayOfWeek: datePickerNaiveFirstDayOfWeek(datePickerFirstDayOfWeek(props)),
    minutes: dateTimePickerStepOf(props),
    shortcuts: naiveDateShortcuts('datetime', props),
    class: [...dateTimePickerModifierClasses(props)].flat(),
    onClear: () => {
      emitDateClear(props)
      emitDateChange(props, null)
    },
    onFocus: () => emitDateFocus(props),
    onBlur: () => emitDateBlur(props),
  })
}

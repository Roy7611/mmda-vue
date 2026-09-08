import { h } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { UiTimePickerProps } from '@mmda/vui'
import {
  TIME_PICKER_FORMAT,
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFormatOf,
  datePickerNaiveFormat,
  datePickerShowClear,
  dateTimePickerStepOf,
  emitDateBlur,
  emitDateChange,
  emitDateClear,
  emitDateFocus,
  htmlAttributesOf,
  timePickerModifierClasses,
} from '@mmda/vui'
import { fromTs, toTs } from './date_picker'

export function createTimePicker(props: UiTimePickerProps) {
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

  return h(NDatePicker, {
    ...rest,
    ...htmlAttributesOf(props),
    type: 'time',
    value: toTs(datePickerDateOf(props) ?? null),
    'onUpdate:value': (next: number | null) => emitDateChange(props, fromTs(next)),
    format: datePickerNaiveFormat(datePickerFormatOf(props, TIME_PICKER_FORMAT)),
    placeholder,
    disabled,
    readonly: readonly === true,
    inputReadonly: !datePickerAllowInput(props),
    clearable: datePickerShowClear(props),
    minutes: dateTimePickerStepOf(props),
    class: [...timePickerModifierClasses(props)].flat(),
    onClear: () => {
      emitDateClear(props)
      emitDateChange(props, null)
    },
    onFocus: () => emitDateFocus(props),
    onBlur: () => emitDateBlur(props),
  })
}

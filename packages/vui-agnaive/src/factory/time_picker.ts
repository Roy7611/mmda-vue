import { h } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { UiTimePickerProps } from '@mmda/core'
import { dateTimePickerStepOf, timePickerModifierClasses, uiRenderProps } from '@mmda/core'
import { TIME_PICKER_FORMAT, datePickerAllowInput, datePickerDateOf, datePickerFormatOf, datePickerShowClear, emitDateBlur, emitDateClear, emitDateFocus } from '@mmda/core'
import { emitDateChange } from '@mmda/vui'
import { datePickerNaiveFormat } from '@mmda/vui'
import { fromTs, toTs } from './date_picker'
import type { VuiModelProps } from "@mmda/vui"

export function createTimePicker(props: VuiModelProps<UiTimePickerProps>) {
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
    ...rest
  } = props

  return h(NDatePicker as any, {
    ...rest,
    ...uiRenderProps(props).attributes,
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

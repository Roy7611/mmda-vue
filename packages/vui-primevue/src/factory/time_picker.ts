import { h } from "vue";
import DatePicker from "primevue/datepicker";
import type { UiTimePickerProps } from "@mmda/vui";
import {
  TIME_PICKER_FORMAT,
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFormatOf,
  datePickerMaxOf,
  datePickerMinOf,
  datePickerPrimeFormat,
  datePickerShowClear,
  dateTimePickerStepOf,
  emitDateBlur,
  emitDateChange,
  emitDateClear,
  emitDateFocus,
  htmlAttributesOf,
  timePickerModifierClasses,
} from "@mmda/vui";

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
    openOnFocus,
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
  } = props;

  return h(DatePicker, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: datePickerDateOf(props) ?? null,
    "onUpdate:modelValue": (next: Date | null) =>
      emitDateChange(props, next ?? null),
    minDate: datePickerMinOf(props) ?? undefined,
    maxDate: datePickerMaxOf(props) ?? undefined,
    dateFormat: datePickerPrimeFormat(
      datePickerFormatOf(props, TIME_PICKER_FORMAT),
    ),
    placeholder,
    disabled,
    manualInput: datePickerAllowInput(props),
    showClear: datePickerShowClear(props),
    showOnFocus: openOnFocus !== false,
    readonly: readonly === true,
    timeOnly: true,
    showSeconds: true,
    hourFormat: "24",
    stepMinute: dateTimePickerStepOf(props),
    class: [...timePickerModifierClasses(props)].flat(),
    onClear: () => {
      emitDateClear(props);
      emitDateChange(props, null);
    },
    onFocus: () => emitDateFocus(props),
    onBlur: () => emitDateBlur(props),
  });
}

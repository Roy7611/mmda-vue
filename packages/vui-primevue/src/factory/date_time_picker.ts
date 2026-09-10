import { h } from "vue";
import DatePicker from "primevue/datepicker";
import type { UiDateTimePickerProps } from "@mmda/core"
import { dateTimePickerModifierClasses, dateTimePickerStepOf } from "@mmda/core"
import { DATE_TIME_PICKER_FORMAT, datePickerAllowInput, datePickerDateOf, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerShowClear, emitDateBlur, emitDateClear, emitDateFocus, resolveDateShortcuts } from "@mmda/core"
import { emitDateChange } from "@mmda/vui"
import { datePickerPrimeFormat, htmlAttributesOf } from "@mmda/vui"
import { primeDateShortcutFooter } from "./date_picker";

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

  const items = resolveDateShortcuts("datetime", props);

  return h(
    DatePicker as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      modelValue: datePickerDateOf(props) ?? null,
      "onUpdate:modelValue": (next: Date | null) =>
        emitDateChange(props, next ?? null),
      minDate: datePickerMinOf(props) ?? undefined,
      maxDate: datePickerMaxOf(props) ?? undefined,
      dateFormat: datePickerPrimeFormat(
        datePickerFormatOf(props, DATE_TIME_PICKER_FORMAT),
      ),
      placeholder,
      disabled,
      manualInput: datePickerAllowInput(props),
      showClear: datePickerShowClear(props),
      showOnFocus: openOnFocus !== false,
      readonly: readonly === true,
      showTime: true,
      showSeconds: true,
      hourFormat: "24",
      stepMinute: dateTimePickerStepOf(props),
      firstDayOfWeek: datePickerFirstDayOfWeek(props),
      showIcon: true,
      class: [...dateTimePickerModifierClasses(props)].flat(),
      onClear: () => {
        emitDateClear(props);
        emitDateChange(props, null);
      },
      onFocus: () => emitDateFocus(props),
      onBlur: () => emitDateBlur(props),
    },
    primeDateShortcutFooter(items, (value) => emitDateChange(props, value)),
  );
}

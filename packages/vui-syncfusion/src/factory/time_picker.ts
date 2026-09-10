import { h } from "vue";
import { TimePickerComponent } from "@syncfusion/ej2-vue-calendars";
import type { UiTimePickerProps } from "@mmda/core"
import { dateTimePickerStepOf, timePickerModifierClasses } from "@mmda/core"
import { TIME_PICKER_FORMAT, datePickerAllowInput, datePickerDateOf, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerShowClear, emitDateBlur, emitDateClear, emitDateFocus } from "@mmda/core"
import { emitDateChange } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

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
    inputFormats,
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

  const cssClass = timePickerModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(TimePickerComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: datePickerDateOf(props) ?? null,
    min: datePickerMinOf(props) ?? undefined,
    max: datePickerMaxOf(props) ?? undefined,
    format: datePickerFormatOf(props, TIME_PICKER_FORMAT),
    placeholder,
    enabled: !disabled,
    allowEdit: datePickerAllowInput(props),
    showClearButton: datePickerShowClear(props),
    openOnFocus: openOnFocus === true,
    readonly: readonly === true,
    strictMode: true,
    step: dateTimePickerStepOf(props),
    ...(inputFormats ? { inputFormats } : {}),
    cssClass,
    change: (args: { value?: Date | null }) =>
      emitDateChange(props, args?.value ?? null),
    cleared: () => {
      emitDateClear(props);
      emitDateChange(props, null);
    },
    focus: () => emitDateFocus(props),
    blur: () => emitDateBlur(props),
  });
}

import { h } from "vue";
import { DateRangePickerComponent } from "@syncfusion/ej2-vue-calendars";
import type { UiDateRangePickerProps } from "@mmda/core"
import { dateRangePickerModifierClasses, dateRangePickerSeparatorOf, dateRangePickerValueOf } from "@mmda/core"
import { DATE_RANGE_PICKER_FORMAT, datePickerAllowInput, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerShowClear, emitDateBlur, emitDateChange, emitDateClear, emitDateFocus, resolveDateShortcutValue, resolveDateShortcuts } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

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
    openOnFocus,
    inputFormats,
    readonly,
    showShortcuts: _showShortcuts,
    shortcuts: _shortcuts,
    firstDayOfWeek: _firstDayOfWeek,
    separator: _separator,
    minDays,
    maxDays,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    enabled: _enabled,
    strictMode: _strictMode,
    showTodayButton: _showTodayButton,
    ...rest
  } = props;

  const cssClass = dateRangePickerModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const bound = dateRangePickerValueOf(props);
  const items = resolveDateShortcuts("range", props);
  const presets = items.map((item) => {
    const value = resolveDateShortcutValue(item);
    const pair = Array.isArray(value) ? value : value ? [value, value] : [];
    return {
      label: item.label,
      start: pair[0],
      end: pair[1],
    };
  });

  return h(DateRangePickerComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    startDate: bound?.[0] ?? null,
    endDate: bound?.[1] ?? null,
    min: datePickerMinOf(props) ?? undefined,
    max: datePickerMaxOf(props) ?? undefined,
    format: datePickerFormatOf(props, DATE_RANGE_PICKER_FORMAT),
    separator: dateRangePickerSeparatorOf(props),
    placeholder,
    enabled: !disabled,
    allowEdit: datePickerAllowInput(props),
    showClearButton: datePickerShowClear(props),
    openOnFocus: openOnFocus === true,
    readonly: readonly === true,
    strictMode: true,
    firstDayOfWeek: datePickerFirstDayOfWeek(props),
    ...(typeof minDays === "number" ? { minDays } : {}),
    ...(typeof maxDays === "number" ? { maxDays } : {}),
    ...(inputFormats ? { inputFormats } : {}),
    ...(presets.length ? { presets } : {}),
    cssClass,
    change: (args: { startDate?: Date | null; endDate?: Date | null }) => {
      const start = args?.startDate ?? null;
      const end = args?.endDate ?? null;
      emitDateChange(props, start && end ? [start, end] : null);
    },
    cleared: () => {
      emitDateClear(props);
      emitDateChange(props, null);
    },
    focus: () => emitDateFocus(props),
    blur: () => emitDateBlur(props),
  });
}

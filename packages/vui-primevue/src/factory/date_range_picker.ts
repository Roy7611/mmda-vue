import { h } from "vue";
import DatePicker from "primevue/datepicker";
import type { UiDateRangePickerProps } from "@mmda/core"
import { dateRangePickerModifierClasses, dateRangePickerValueOf, uiRenderProps } from "@mmda/core"
import { DATE_RANGE_PICKER_FORMAT, datePickerAllowInput, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerShowClear, emitDateBlur, emitDateClear, emitDateFocus, resolveDateShortcuts } from "@mmda/core"
import { emitDateChange } from "@mmda/vui"
import { datePickerPrimeFormat } from "@mmda/vui"
import { primeDateShortcutFooter } from "./date_picker";
import type { VuiModelProps } from "@mmda/vui"

export function createDateRangePicker(props: VuiModelProps<UiDateRangePickerProps>) {
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
    separator: _separator,
    minDays: _minDays,
    maxDays: _maxDays,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const bound = dateRangePickerValueOf(props);
  const items = resolveDateShortcuts("range", props);

  return h(
    DatePicker as any,
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      modelValue: bound ?? null,
      "onUpdate:modelValue": (next: Date[] | null) => {
        if (!Array.isArray(next) || next.length < 2 || !next[0] || !next[1]) {
          emitDateChange(props, null);
          return;
        }
        emitDateChange(props, [next[0], next[1]]);
      },
      minDate: datePickerMinOf(props) ?? undefined,
      maxDate: datePickerMaxOf(props) ?? undefined,
      dateFormat: datePickerPrimeFormat(
        datePickerFormatOf(props, DATE_RANGE_PICKER_FORMAT),
      ),
      placeholder,
      disabled,
      manualInput: datePickerAllowInput(props),
      showClear: datePickerShowClear(props),
      showOnFocus: openOnFocus !== false,
      readonly: readonly === true,
      selectionMode: "range",
      hideOnRangeSelection: true,
      firstDayOfWeek: datePickerFirstDayOfWeek(props),
      showIcon: true,
      class: [...dateRangePickerModifierClasses(props)].flat(),
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

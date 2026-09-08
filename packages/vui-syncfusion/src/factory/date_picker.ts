import { h } from "vue";
import { DatePickerComponent } from "@syncfusion/ej2-vue-calendars";
import type { UiDatePickerProps, UiDateShortcut } from "@mmda/vui";
import {
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFirstDayOfWeek,
  datePickerFormatOf,
  datePickerMaxOf,
  datePickerMinOf,
  datePickerModifierClasses,
  datePickerShowClear,
  emitDateBlur,
  emitDateChange,
  emitDateClear,
  emitDateFocus,
  htmlAttributesOf,
  resolveDateShortcutValue,
  resolveDateShortcuts,
} from "@mmda/vui";

function shortcutButtons(items: UiDateShortcut[], onPick: (value: unknown) => void) {
  if (!items.length) return undefined;
  return {
    footerTemplate: () =>
      h(
        "div",
        { class: "mmda-datepicker__shortcuts" },
        items.map((item) =>
          h(
            "button",
            {
              key: item.label,
              type: "button",
              class: "e-btn e-flat",
              onClick: () => onPick(resolveDateShortcutValue(item)),
            },
            item.label,
          ),
        ),
      ),
  };
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
    openOnFocus,
    inputFormats,
    readonly,
    showShortcuts: _showShortcuts,
    shortcuts: _shortcuts,
    firstDayOfWeek: _firstDayOfWeek,
    onChange: _onChange,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    htmlAttributes,
    class: _className,
    precision,
    enabled: _enabled,
    strictMode: _strictMode,
    showTodayButton: _showTodayButton,
    selectionMode: _selectionMode,
    ...rest
  } = props;

  const cssClass = datePickerModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const month = precision === "month";
  const items = resolveDateShortcuts(month ? "month" : "day", props);

  return h(
    DatePickerComponent as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: datePickerDateOf(props) ?? null,
      min: datePickerMinOf(props) ?? undefined,
      max: datePickerMaxOf(props) ?? undefined,
      format: datePickerFormatOf(props),
      placeholder,
      enabled: !disabled,
      allowEdit: datePickerAllowInput(props),
      showClearButton: datePickerShowClear(props),
      openOnFocus: openOnFocus === true,
      readonly: readonly === true,
      strictMode: true,
      firstDayOfWeek: datePickerFirstDayOfWeek(props),
      ...(inputFormats ? { inputFormats } : {}),
      ...(month ? { start: "Year", depth: "Year" } : {}),
      showTodayButton: false,
      cssClass,
      change: (args: { value?: Date | null }) =>
        emitDateChange(props, args?.value ?? null),
      cleared: () => {
        emitDateClear(props);
        emitDateChange(props, null);
      },
      focus: () => emitDateFocus(props),
      blur: () => emitDateBlur(props),
    },
    shortcutButtons(items, (value) => emitDateChange(props, value)),
  );
}

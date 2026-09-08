import { h } from "vue";
import DatePicker from "primevue/datepicker";
import type { UiDatePickerProps, UiDateShortcut } from "@mmda/vui";
import {
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFirstDayOfWeek,
  datePickerFormatOf,
  datePickerMaxOf,
  datePickerMinOf,
  datePickerModifierClasses,
  datePickerPrimeFormat,
  datePickerShowClear,
  emitDateBlur,
  emitDateChange,
  emitDateClear,
  emitDateFocus,
  htmlAttributesOf,
  resolveDateShortcutValue,
  resolveDateShortcuts,
} from "@mmda/vui";

export function primeDateShortcutFooter(
  items: UiDateShortcut[],
  onPick: (value: unknown) => void,
) {
  if (!items.length) return undefined;
  return {
    footer: () =>
      h(
        "div",
        { class: "mmda-datepicker__shortcuts" },
        items.map((item) =>
          h(
            "button",
            {
              key: item.label,
              type: "button",
              class: "p-button p-button-text p-button-sm",
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
    inputFormats: _inputFormats,
    readonly,
    showShortcuts: _showShortcuts,
    shortcuts: _shortcuts,
    firstDayOfWeek: _firstDayOfWeek,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    precision,
    enabled: _enabled,
    strictMode: _strictMode,
    showTodayButton: _showTodayButton,
    selectionMode: _selectionMode,
    ...rest
  } = props;

  const month = precision === "month";
  const items = resolveDateShortcuts(month ? "month" : "day", props);

  return h(
    DatePicker,
    {
      ...rest,
      ...htmlAttributesOf(props),
      modelValue: datePickerDateOf(props) ?? null,
      "onUpdate:modelValue": (next: Date | null) =>
        emitDateChange(props, next ?? null),
      minDate: datePickerMinOf(props) ?? undefined,
      maxDate: datePickerMaxOf(props) ?? undefined,
      dateFormat: datePickerPrimeFormat(datePickerFormatOf(props)),
      placeholder,
      disabled,
      manualInput: datePickerAllowInput(props),
      showClear: datePickerShowClear(props),
      showOnFocus: openOnFocus !== false,
      readonly: readonly === true,
      firstDayOfWeek: datePickerFirstDayOfWeek(props),
      showIcon: true,
      ...(month ? { view: "month" } : {}),
      class: [...datePickerModifierClasses(props)].flat(),
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

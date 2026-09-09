import { h } from "vue";
import { DateTimePickerComponent } from "@syncfusion/ej2-vue-calendars";
import type { UiDateTimePickerProps } from "@mmda/core"
import type { UiDateShortcut } from "@mmda/core"
import { dateTimePickerModifierClasses, dateTimePickerStepOf } from "@mmda/core"
import { DATE_TIME_PICKER_FORMAT, datePickerAllowInput, datePickerDateOf, datePickerFirstDayOfWeek, datePickerFormatOf, datePickerMaxOf, datePickerMinOf, datePickerShowClear, emitDateBlur, emitDateChange, emitDateClear, emitDateFocus, resolveDateShortcutValue, resolveDateShortcuts } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

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

  const cssClass = dateTimePickerModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const items = resolveDateShortcuts("datetime", props);

  return h(
    DateTimePickerComponent as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: datePickerDateOf(props) ?? null,
      min: datePickerMinOf(props) ?? undefined,
      max: datePickerMaxOf(props) ?? undefined,
      format: datePickerFormatOf(props, DATE_TIME_PICKER_FORMAT),
      placeholder,
      enabled: !disabled,
      allowEdit: datePickerAllowInput(props),
      showClearButton: datePickerShowClear(props),
      openOnFocus: openOnFocus === true,
      readonly: readonly === true,
      strictMode: true,
      step: dateTimePickerStepOf(props),
      firstDayOfWeek: datePickerFirstDayOfWeek(props),
      ...(inputFormats ? { inputFormats } : {}),
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
    items.length
      ? {
          footerTemplate: () =>
            h(
              "div",
              { class: "mmda-datepicker__shortcuts" },
              items.map((item: UiDateShortcut) =>
                h(
                  "button",
                  {
                    key: item.label,
                    type: "button",
                    class: "e-btn e-flat",
                    onClick: () =>
                      emitDateChange(props, resolveDateShortcutValue(item)),
                  },
                  item.label,
                ),
              ),
            ),
        }
      : undefined,
  );
}

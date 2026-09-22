import { createElement, type ReactElement } from "react";
import {
  CalendarComponent,
  DatePickerComponent,
  DateRangePickerComponent,
  DateTimePickerComponent,
  TimePickerComponent,
} from "@syncfusion/ej2-react-calendars";
import {
  DATE_TIME_PICKER_FORMAT,
  DATE_RANGE_PICKER_FORMAT,
  MONTH_PICKER_FORMAT,
  TIME_PICKER_FORMAT,
  calendarBoundValue,
  calendarModifierClasses,
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFirstDayOfWeek,
  datePickerFormatOf,
  datePickerMaxOf,
  datePickerMinOf,
  datePickerModifierClasses,
  datePickerShowClear,
  dateRangePickerModifierClasses,
  dateRangePickerSeparatorOf,
  dateRangePickerValueOf,
  dateTimePickerModifierClasses,
  dateTimePickerStepOf,
  resolveDateShortcutValue,
  resolveDateShortcuts,
  timePickerModifierClasses,
  type UiCalendarProps,
  type UiDatePickerProps,
  type UiDateRangePickerProps,
  type UiDateTimePickerProps,
  type UiTimePickerProps,
} from "@mmda/core";
import { sfCssClass, sfHtmlAttributes } from "./utils";

function emitDateChange(props: any, value: unknown): void {
  props.onChange?.(value);
  props.onUpdatePicker?.(value);
}

function dateCommonProps(props: any): Record<string, unknown> {
  return {
    value: datePickerDateOf(props) ?? null,
    min: datePickerMinOf(props) ?? undefined,
    max: datePickerMaxOf(props) ?? undefined,
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    allowEdit: datePickerAllowInput(props),
    showClearButton: datePickerShowClear(props),
    openOnFocus: props.openOnFocus === true,
    readonly: props.readonly === true,
    strictMode: true,
    firstDayOfWeek: datePickerFirstDayOfWeek(props),
    htmlAttributes: sfHtmlAttributes(props),
  };
}

function dateChangeHandler(
  props: any,
): (args: { value?: Date | null }) => void {
  return (args) => emitDateChange(props, args?.value ?? null);
}

export function createDatePicker(props: UiDatePickerProps): ReactElement {
  const month = (props as any).precision === "month";
  return createElement(DatePickerComponent as any, {
    ...dateCommonProps(props),
    format: datePickerFormatOf(props, month ? MONTH_PICKER_FORMAT : undefined),
    cssClass: sfCssClass(props, datePickerModifierClasses(props)),
    ...(month ? { start: "Year", depth: "Year" } : {}),
    change: dateChangeHandler(props),
    cleared: () => {
      props.onClear?.();
      emitDateChange(props, null);
    },
    focus: () => props.onFocus?.(),
    blur: () => props.onBlur?.(),
  });
}

export function createMonthPicker(props: UiDatePickerProps): ReactElement {
  return createDatePicker({
    ...props,
    precision: "month",
    format: props.format ?? MONTH_PICKER_FORMAT,
  } as UiDatePickerProps);
}

export function createDateTimePicker(
  props: UiDateTimePickerProps,
): ReactElement {
  return createElement(DateTimePickerComponent as any, {
    ...dateCommonProps(props),
    format: datePickerFormatOf(props, DATE_TIME_PICKER_FORMAT),
    step: dateTimePickerStepOf(props),
    cssClass: sfCssClass(props, dateTimePickerModifierClasses(props)),
    change: dateChangeHandler(props),
    cleared: () => {
      props.onClear?.();
      emitDateChange(props, null);
    },
    focus: () => props.onFocus?.(),
    blur: () => props.onBlur?.(),
  });
}

export function createTimePicker(props: UiTimePickerProps): ReactElement {
  return createElement(TimePickerComponent as any, {
    value: datePickerDateOf(props as any) ?? null,
    min: datePickerMinOf(props as any) ?? undefined,
    max: datePickerMaxOf(props as any) ?? undefined,
    format: datePickerFormatOf(props as any, TIME_PICKER_FORMAT),
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    allowEdit: datePickerAllowInput(props as any),
    showClearButton: datePickerShowClear(props as any),
    readonly: (props as any).readonly === true,
    strictMode: true,
    step: dateTimePickerStepOf(props),
    cssClass: sfCssClass(props, timePickerModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: dateChangeHandler(props),
    cleared: () => {
      props.onClear?.();
      emitDateChange(props, null);
    },
    focus: () => props.onFocus?.(),
    blur: () => props.onBlur?.(),
  });
}

export function createDateRangePicker(
  props: UiDateRangePickerProps,
): ReactElement {
  const bound = dateRangePickerValueOf(props);
  const shortcuts = resolveDateShortcuts("range", props);
  const presets = shortcuts.map((item) => {
    const value = resolveDateShortcutValue(item);
    const pair = Array.isArray(value) ? value : value ? [value, value] : [];
    return { label: item.label, start: pair[0], end: pair[1] };
  });

  return createElement(DateRangePickerComponent as any, {
    startDate: bound?.[0] ?? null,
    endDate: bound?.[1] ?? null,
    min: datePickerMinOf(props) ?? undefined,
    max: datePickerMaxOf(props) ?? undefined,
    format: datePickerFormatOf(props, DATE_RANGE_PICKER_FORMAT),
    separator: dateRangePickerSeparatorOf(props),
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    allowEdit: datePickerAllowInput(props),
    showClearButton: datePickerShowClear(props),
    openOnFocus: props.openOnFocus === true,
    readonly: props.readonly === true,
    strictMode: true,
    firstDayOfWeek: datePickerFirstDayOfWeek(props),
    ...(typeof props.minDays === "number" ? { minDays: props.minDays } : {}),
    ...(typeof props.maxDays === "number" ? { maxDays: props.maxDays } : {}),
    ...(presets.length ? { presets } : {}),
    cssClass: sfCssClass(props, dateRangePickerModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { startDate?: Date | null; endDate?: Date | null }) => {
      const start = args?.startDate ?? null;
      const end = args?.endDate ?? null;
      emitDateChange(props, start && end ? [start, end] : null);
    },
    cleared: () => {
      props.onClear?.();
      emitDateChange(props, null);
    },
    focus: () => props.onFocus?.(),
    blur: () => props.onBlur?.(),
  });
}

export function createCalendar(
  props: UiCalendarProps<ReactElement>,
): ReactElement {
  const value = calendarBoundValue(props);
  return createElement(CalendarComponent as any, {
    value: value ?? null,
    values: Array.isArray(value) ? value : undefined,
    min: props.min,
    max: props.max,
    firstDayOfWeek: props.firstDayOfWeek,
    cssClass: sfCssClass(props, calendarModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { value?: Date | Date[] }) =>
      props.onChange?.(args?.value ?? null),
  });
}

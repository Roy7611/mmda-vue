import { h } from "vue";
import DatePicker from "primevue/datepicker";
import type { UiCalendarProps } from '@mmda/core';
import { calendarBoundValue, calendarDaySelected, calendarModifierClasses, calendarPrimeView, emitCalendarChange, htmlAttributesOf, isCalendarDateDisabled, sameCalendarDay } from "@mmda/vui"
import { primeVueI18n } from "../prime_i18n";

function primeLocaleOf(locale?: string, firstDayOfWeek?: number) {
  if (!locale && firstDayOfWeek == null) return undefined;
  const key = !locale
    ? undefined
    : locale.startsWith("zh")
      ? "zh"
      : locale.startsWith("en")
        ? "en"
        : locale;
  const pack = key ? primeVueI18n[key] ?? primeVueI18n.en : undefined;
  if (!pack && firstDayOfWeek == null) return undefined;
  return {
    ...(pack ?? {}),
    ...(firstDayOfWeek != null ? { firstDayOfWeek } : {}),
  };
}

function slotDate(meta: any): Date | undefined {
  if (!meta) return undefined;
  if (meta instanceof Date) return meta;
  if (typeof meta.year === "number" && typeof meta.month === "number") {
    return new Date(meta.year, meta.month, meta.day ?? 1);
  }
  return undefined;
}

export function createCalendar(props: UiCalendarProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    selectionMode,
    min,
    max,
    disabled,
    firstDayOfWeek,
    view,
    depth: _depth,
    showTodayButton: _showTodayButton,
    showOtherMonth,
    isDateDisabled,
    dayCellRenderer,
    locale,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  const multiple = selectionMode === "multiple";
  const bound = calendarBoundValue(props);
  const today = new Date();
  const primeView = calendarPrimeView(view);
  const localeObj = primeLocaleOf(locale, firstDayOfWeek);

  return h(
    DatePicker,
    {
      ...rest,
      ...htmlAttributesOf(props),
      inline: true,
      modelValue: bound ?? null,
      "onUpdate:modelValue": (next: Date | Date[] | null) =>
        emitCalendarChange(props, next ?? (multiple ? [] : null)),
      selectionMode: multiple ? "multiple" : "single",
      minDate: min,
      maxDate: max,
      disabled,
      ...(firstDayOfWeek != null ? { firstDayOfWeek } : {}),
      ...(primeView ? { view: primeView } : {}),
      ...(showOtherMonth != null ? { showOtherMonths: showOtherMonth } : {}),
      ...(localeObj ? { locale: localeObj } : {}),
      class: [...calendarModifierClasses(props)].flat(),
    },
    dayCellRenderer || isDateDisabled
      ? {
          date: (slot: { date?: any; selected?: boolean }) => {
            const date = slotDate(slot.date);
            if (!date) return slot.date?.day;
            const disabledDay = isCalendarDateDisabled(date, props);
            if (!dayCellRenderer) {
              return h(
                "span",
                {
                  class: [
                    "mmda-calendar-day",
                    disabledDay ? "mmda-calendar-day--disabled" : undefined,
                  ],
                },
                date.getDate(),
              );
            }
            return dayCellRenderer({
              date,
              selected: slot.selected ?? calendarDaySelected(bound, date),
              disabled: disabledDay,
              otherMonth: !!slot.date?.otherMonth,
              today: sameCalendarDay(date, today),
            });
          },
        }
      : undefined,
  );
}

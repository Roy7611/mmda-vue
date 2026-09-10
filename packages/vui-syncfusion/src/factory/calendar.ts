import { h, render } from "vue";
import { CalendarComponent } from "@syncfusion/ej2-vue-calendars";
import type { UiCalendarProps, UiCalendarView } from '@mmda/core';
import { calendarBoundValue, calendarDaySelected, calendarModifierClasses, emitCalendarChange, htmlAttributesOf, isCalendarDateDisabled, sameCalendarDay } from "@mmda/vui"

export function calendarEj2View(
  view?: UiCalendarView,
): 'Month' | 'Year' | 'Decade' | undefined {
  if (!view) return undefined
  if (view === 'year') return 'Year'
  if (view === 'decade') return 'Decade'
  return 'Month'
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
    depth,
    showTodayButton,
    showOtherMonth: _showOtherMonth,
    isDateDisabled,
    dayCellRenderer,
    locale,
    onChange: _onChange,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const multiple = selectionMode === "multiple";
  const bound = calendarBoundValue(props);
  const start = calendarEj2View(view);
  const ejDepth = calendarEj2View(depth);
  const cssClass = calendarModifierClasses(props).flat().filter(Boolean).join(" ");

  const today = new Date();

  return h(CalendarComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    ...(multiple
      ? {
          isMultiSelection: true,
          values: Array.isArray(bound) ? bound : [],
        }
      : { value: bound ?? null }),
    min,
    max,
    enabled: disabled ? false : true,
    ...(firstDayOfWeek != null ? { firstDayOfWeek } : {}),
    ...(start ? { start } : {}),
    ...(ejDepth ? { depth: ejDepth } : {}),
    ...(showTodayButton != null ? { showTodayButton } : {}),
    ...(locale ? { locale } : {}),
    cssClass,
    renderDayCell: (args: any) => {
      const date: Date | undefined = args?.date;
      if (!date) return;
      if (isCalendarDateDisabled(date, props)) {
        args.isDisabled = true;
      }
      if (!dayCellRenderer) return;
      const cell = args.element as HTMLElement | undefined;
      if (!cell) return;
      let host = cell.querySelector(".mmda-calendar-day-host") as HTMLElement | null;
      if (!host) {
        host = document.createElement("span");
        host.className = "mmda-calendar-day-host";
        cell.appendChild(host);
      }
      const otherMonth = cell.classList.contains("e-other-month");
      const vnode = dayCellRenderer({
        date,
        disabled: !!args.isDisabled,
        otherMonth,
        today: sameCalendarDay(date, today),
        selected: calendarDaySelected(bound, date),
      });
      render(h("span", { class: "mmda-calendar-day" }, [vnode]), host);
    },
    change: (args: any) => {
      emitCalendarChange(
        props,
        multiple ? (args?.values ?? []) : (args?.value ?? null),
      );
    },
  });
}

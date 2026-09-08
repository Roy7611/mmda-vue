import type {
  UiSchedulerEvent,
  UiSchedulerView,
  UiSchedulerViewProps,
} from '@mmda/vui'
import {
  schedulerHiddenDaysOf,
  schedulerHourHms,
  schedulerSlotDurationHms,
  schedulerWorkDaysOf,
} from '@mmda/vui'

export const FC_SCHEDULER_VIEWS: Record<string, string> = {
  day: 'timeGridDay',
  week: 'timeGridWeek',
  workWeek: 'timeGridWeek',
  month: 'dayGridMonth',
  agenda: 'listWeek',
  year: 'multiMonthYear',
}

export function fcInitialViewOf(view?: UiSchedulerView): string {
  if (!view || view.startsWith('timeline')) return 'timeGridWeek'
  return FC_SCHEDULER_VIEWS[view as keyof typeof FC_SCHEDULER_VIEWS] ?? 'timeGridWeek'
}

export function uiViewOfFc(viewType?: string): UiSchedulerView {
  switch (viewType) {
    case 'timeGridDay':
      return 'day'
    case 'timeGridWeek':
      return 'week'
    case 'dayGridMonth':
      return 'month'
    case 'listWeek':
    case 'listDay':
    case 'listMonth':
      return 'agenda'
    case 'multiMonthYear':
      return 'year'
    default:
      return 'week'
  }
}

export function mapUiEventToFc(event: UiSchedulerEvent) {
  const durationMs =
    event.start && event.end
      ? new Date(event.end as any).getTime() - new Date(event.start as any).getTime()
      : undefined
  const mapped: Record<string, unknown> = {
    id: String(event.id),
    title: event.title ?? '',
    start: event.start,
    end: event.end ?? undefined,
    allDay: !!event.allDay,
    url: event.url,
    display: event.display === 'background' ? 'background' : undefined,
    backgroundColor: event.color,
    editable: event.readonly === false ? true : event.readonly ? false : undefined,
    classNames: [] as string[],
    extendedProps: {
      location: event.location,
      description: event.description,
      resourceId: event.resourceId,
      recurrenceException: event.recurrenceException,
      readonly: event.readonly,
      raw: event,
    },
  }
  if (event.recurrenceRule) {
    mapped.rrule = event.recurrenceRule
    if (durationMs && durationMs > 0) {
      mapped.duration = { milliseconds: durationMs }
    }
    if (event.recurrenceException) {
      mapped.exdate = String(event.recurrenceException)
        .split(/[,;]/)
        .map((part) => part.trim())
        .filter(Boolean)
    }
  }
  return mapped
}

export function fcEventToUi(event: any): UiSchedulerEvent {
  const extra = event?.extendedProps ?? {}
  const raw = extra.raw as UiSchedulerEvent | undefined
  return {
    ...(raw ?? {}),
    id: event?.id ?? raw?.id,
    title: event?.title ?? raw?.title,
    start: event?.start ?? raw?.start ?? new Date(),
    end: event?.end ?? raw?.end ?? null,
    allDay: event?.allDay ?? raw?.allDay,
    url: event?.url || raw?.url,
    display: event?.display === 'background' ? 'background' : raw?.display ?? 'auto',
    color: event?.backgroundColor ?? raw?.color,
    location: extra.location ?? raw?.location,
    description: extra.description ?? raw?.description,
    resourceId: extra.resourceId ?? raw?.resourceId,
    recurrenceRule: event?.rrule ?? raw?.recurrenceRule,
    recurrenceException: extra.recurrenceException ?? raw?.recurrenceException,
    readonly: extra.readonly ?? raw?.readonly,
  }
}

export function fcCalendarOptionsOf(props: UiSchedulerViewProps) {
  const workDays = schedulerWorkDaysOf(props.workDays)
  const hiddenDays = schedulerHiddenDaysOf(props)
  return {
    initialView: fcInitialViewOf(props.view),
    initialDate: props.selectedDate,
    firstDay: props.firstDayOfWeek,
    weekends: props.showWeekend !== false,
    hiddenDays,
    nowIndicator: !!props.showNowIndicator,
    weekNumbers: !!props.showWeekNumber,
    selectable: !!props.allowSelect && !props.readonly,
    editable: !props.readonly && props.allowDrag !== false,
    eventDurationEditable: !props.readonly && props.allowResize !== false,
    eventOverlap: props.allowOverlap !== false,
    selectOverlap: props.allowSelectOverlap !== false,
    slotDuration: schedulerSlotDurationHms(props.slotDuration),
    slotMinTime: schedulerHourHms(props.startHour, '00:00:00'),
    slotMaxTime: schedulerHourHms(props.endHour, '24:00:00'),
    headerToolbar: props.showHeader === false ? false : undefined,
    validRange:
      props.minDate || props.maxDate
        ? {
            start: props.minDate,
            end: props.maxDate,
          }
        : undefined,
    businessHours: props.workHours
      ? {
          daysOfWeek: workDays,
          startTime: props.workHours.start,
          endTime: props.workHours.end,
        }
      : undefined,
    duration: props.dayCount ? { days: props.dayCount } : undefined,
  }
}

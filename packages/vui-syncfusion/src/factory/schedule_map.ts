import type { UiSchedulerEvent, UiSchedulerResource, UiSchedulerView, UiSchedulerViewProps } from '@mmda/vui'
import { isSchedulerTimelineView, schedulerHourHms, schedulerSlotDurationOf, schedulerWorkDaysOf } from '@mmda/vui'

export const EJ2_SCHEDULER_VIEWS: Record<UiSchedulerView, string> = {
  day: 'Day',
  week: 'Week',
  workWeek: 'WorkWeek',
  month: 'Month',
  agenda: 'Agenda',
  year: 'Year',
  timelineDay: 'TimelineDay',
  timelineWeek: 'TimelineWeek',
  timelineWorkWeek: 'TimelineWorkWeek',
  timelineMonth: 'TimelineMonth',
}

export const EJ2_TO_UI_VIEW: Record<string, UiSchedulerView> = Object.fromEntries(
  Object.entries(EJ2_SCHEDULER_VIEWS).map(([ui, ej2]) => [ej2, ui as UiSchedulerView]),
) as Record<string, UiSchedulerView>

export function mapUiEventsToEj2(events: UiSchedulerEvent[] = []) {
  return events.map((event) => ({
    ...event,
    Id: event.id,
    Subject: event.title ?? '',
    StartTime: event.start ? new Date(event.start as any) : undefined,
    EndTime: event.end ? new Date(event.end as any) : undefined,
    IsAllDay: !!event.allDay,
    OwnerId: event.resourceId ?? undefined,
    Location: event.location,
    Description: event.description,
    RecurrenceRule: event.recurrenceRule,
    RecurrenceException: event.recurrenceException,
    IsBlock: event.display === 'background',
    IsReadonly: !!event.readonly,
    CategoryColor: event.color,
    Url: event.url,
  }))
}

export function ej2RecordToUiEvent(record: any): UiSchedulerEvent {
  const start = record?.StartTime ?? record?.start
  return {
    ...(record ?? {}),
    id: record?.Id ?? record?.id,
    title: record?.Subject ?? record?.title,
    start: start ?? new Date(),
    end: record?.EndTime ?? record?.end ?? null,
    allDay: record?.IsAllDay ?? record?.allDay,
    resourceId: record?.OwnerId ?? record?.resourceId ?? null,
    location: record?.Location ?? record?.location,
    description: record?.Description ?? record?.description,
    recurrenceRule: record?.RecurrenceRule ?? record?.recurrenceRule,
    recurrenceException:
      record?.RecurrenceException ?? record?.recurrenceException,
    display: record?.IsBlock || record?.display === 'background' ? 'background' : 'auto',
    readonly: record?.IsReadonly ?? record?.readonly,
    color: record?.CategoryColor ?? record?.color,
    url: record?.Url ?? record?.url,
  }
}

export function mapUiResourcesToEj2(resources: UiSchedulerResource[] = []) {
  return resources.map((row) => ({
    Id: row.id,
    Text: row.title,
    Color: row.color,
  }))
}

export function schedulerTimeScaleOf(slotDuration?: number) {
  const minutes = schedulerSlotDurationOf(slotDuration)
  if (minutes >= 60) {
    return { enable: true, interval: minutes, slotCount: 1 }
  }
  return {
    enable: true,
    interval: 60,
    slotCount: Math.max(1, Math.round(60 / minutes)),
  }
}

export function schedulerWorkHoursOf(props: UiSchedulerViewProps) {
  if (!props.workHours) return { highlight: false, start: '09:00', end: '18:00' }
  return {
    highlight: true,
    start: props.workHours.start,
    end: props.workHours.end,
  }
}

export function ej2CurrentViewOf(view?: UiSchedulerView): string {
  return EJ2_SCHEDULER_VIEWS[view ?? 'week'] ?? 'Week'
}

export function uiViewOfEj2(currentView?: string): UiSchedulerView {
  return EJ2_TO_UI_VIEW[String(currentView)] ?? 'week'
}

export function usesTimelineOrResources(props: UiSchedulerViewProps): boolean {
  return (
    isSchedulerTimelineView(props.view) || (props.resources?.length ?? 0) > 0
  )
}

export { schedulerHourHms, schedulerWorkDaysOf }

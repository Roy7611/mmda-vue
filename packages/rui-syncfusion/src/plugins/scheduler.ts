import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  isSchedulerTimelineView,
  schedulerHookClass,
  schedulerHourHms,
  schedulerSlotDurationOf,
  schedulerWorkDaysOf,
  UiPluginName,
  type UiPlugin,
  type UiSchedulerEvent,
  type UiSchedulerProps,
  type UiSchedulerResource,
  type UiSchedulerView,
} from '@mmda/core'
import { cssSize, joinClass, reactDomProps } from './utils'

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
    display:
      record?.IsBlock || record?.display === 'background'
        ? 'background'
        : 'auto',
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

function MissingScheduler(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-scheduler-missing' },
    'Scheduler requires @syncfusion/ej2-react-schedule',
  )
}

const SchedulerImpl = lazy(async (): Promise<{
  default: ComponentType<any>
  services: any[]
}> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingScheduler
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-schedule')
    return {
      default: mod.ScheduleComponent as ComponentType<any>,
      services: [
        mod.Day,
        mod.Week,
        mod.WorkWeek,
        mod.Month,
        mod.Agenda,
        mod.Year,
        mod.TimelineViews,
        mod.TimelineMonth,
        mod.Resize,
        mod.DragAndDrop,
      ],
    }
  } catch {
    return { default: MissingScheduler, services: [] }
  }
})

export function SfScheduler(props: UiSchedulerProps): ReactElement {
  const readonly = props.readonly === true
  const resources = mapUiResourcesToEj2(props.resources)
  const currentView = EJ2_SCHEDULER_VIEWS[props.view ?? 'week'] ?? 'Week'

  return createElement(
    'div',
    {
      className: joinClass(schedulerHookClass(props.class, readonly)),
      style: { height: cssSize(props.height, '70vh') },
      ...reactDomProps(props),
    },
    createElement(
      Suspense,
      { fallback: null },
      createElement(SchedulerImpl as any, {
        eventSettings: { dataSource: mapUiEventsToEj2(props.events) },
        group:
          resources.length > 0 ? { byGroupID: true, resources: ['Resources'] } : undefined,
        resources:
          resources.length > 0
            ? [{ name: 'Resources', dataSource: resources, field: 'OwnerId', titleField: 'Text', colorField: 'Color' }]
            : undefined,
        currentView,
        selectedDate: props.selectedDate ? new Date(props.selectedDate as any) : undefined,
        readonly,
        allowDragAndDrop: !readonly && props.allowDrag !== false,
        allowResizing: !readonly && props.allowResize !== false,
        allowAdding: !readonly && props.allowAdd !== false,
        showQuickInfo: props.showQuickInfo !== false,
        showHeaderBar: props.showHeader !== false,
        workDays: schedulerWorkDaysOf(props.workDays),
        workHours: props.workHours
          ? { highlight: true, start: props.workHours.start, end: props.workHours.end }
          : undefined,
        startHour: schedulerHourHms(props.startHour),
        endHour: schedulerHourHms(props.endHour),
        eventRendered: (args: any) => {
          if (props.eventClassName) {
            const extra = props.eventClassName(ej2RecordToUiEvent(args?.data))
            if (extra) args.element?.classList?.add(extra)
          }
        },
        eventClick: (args: any) => {
          void props.onEventClick?.(ej2RecordToUiEvent(args?.event))
        },
        popupOpen: (args: any) => {
          if (readonly) args.cancel = true
        },
      }),
    ),
  )
}

export function createSfSchedulerPlugin(): UiPlugin {
  return {
    name: UiPluginName.scheduler,
    buildUi(_context, props) {
      return SfScheduler(props as UiSchedulerProps)
    },
  }
}

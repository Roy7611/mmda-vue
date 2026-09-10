import {
  defineAsyncComponent,
  defineComponent,
  h,
  onMounted,
  ref,
  shallowRef,
  watch,
  type PropType,
} from 'vue'
import { createNoopSchedulerController, downloadSchedulerExcel, emitSchedulerChange, emitSchedulerEventClick, excelFileName, htmlAttributesOf, openSchedulerEventUrl, schedulerHookClass, schedulerWorkDaysOf, type UiSchedulerController, type UiSchedulerEvent, type UiSchedulerResource, type UiSchedulerView, type UiSchedulerViewProps } from '@mmda/vui'
import {
  ej2CurrentViewOf,
  ej2RecordToUiEvent,
  mapUiEventsToEj2,
  mapUiResourcesToEj2,
  schedulerTimeScaleOf,
  schedulerWorkHoursOf,
  uiViewOfEj2,
  usesTimelineOrResources,
} from '../factory/schedule_map'
import '@syncfusion/ej2-schedule/styles/material3.css'

const ScheduleImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-schedule')
    const {
      ScheduleComponent,
      Day,
      Week,
      WorkWeek,
      Month,
      Agenda,
      Year,
      TimelineViews,
      TimelineMonth,
      TimelineYear,
      Resize,
      DragAndDrop,
    } = mod as any
    return {
      default: defineComponent({
        name: 'SfSchedulerHost',
        components: { ScheduleComponent },
        provide: {
          schedule: [
            Day,
            Week,
            WorkWeek,
            Month,
            Agenda,
            Year,
            TimelineViews,
            TimelineMonth,
            TimelineYear,
            Resize,
            DragAndDrop,
          ],
        },
        setup(_, { attrs }) {
          return () => h(ScheduleComponent as any, attrs)
        },
      }),
    }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-scheduler-missing' },
            'Scheduler requires @syncfusion/ej2-vue-schedule',
          ),
      }),
    }
  }
})

export const SfScheduler = defineComponent({
  name: 'SfScheduler',
  props: {
    events: { type: Array as PropType<UiSchedulerEvent[]>, default: () => [] },
    resources: {
      type: Array as PropType<UiSchedulerResource[]>,
      default: () => [],
    },
    selectedDate: { type: [String, Date] as PropType<string | Date> },
    view: { type: String as PropType<UiSchedulerView>, default: 'week' },
    height: { type: [String, Number], default: '650px' },
    readonly: { type: Boolean, default: false },
    allowDrag: { type: Boolean, default: true },
    allowResize: { type: Boolean, default: true },
    allowAdd: { type: Boolean, default: true },
    locale: { type: String, default: 'zh' },
    firstDayOfWeek: { type: Number },
    workDays: { type: Array as PropType<number[]> },
    showWeekend: { type: Boolean, default: true },
    workHours: { type: Object as PropType<UiSchedulerViewProps['workHours']> },
    startHour: { type: String },
    endHour: { type: String },
    slotDuration: { type: Number },
    showNowIndicator: { type: Boolean, default: false },
    minDate: { type: [String, Date] as PropType<string | Date> },
    maxDate: { type: [String, Date] as PropType<string | Date> },
    allowOverlap: { type: Boolean, default: true },
    allowSelectOverlap: { type: Boolean, default: true },
    allowSelect: { type: Boolean, default: false },
    showHeader: { type: Boolean, default: true },
    showQuickInfo: { type: Boolean, default: true },
    hideEmptyAgendaDays: { type: Boolean, default: false },
    dayCount: { type: Number },
    showWeekNumber: { type: Boolean, default: false },
    onReady: { type: Function as PropType<UiSchedulerViewProps['onReady']> },
    onEventChange: {
      type: Function as PropType<UiSchedulerViewProps['onEventChange']>,
    },
    onEventClick: {
      type: Function as PropType<UiSchedulerViewProps['onEventClick']>,
    },
    onEventDblClick: {
      type: Function as PropType<UiSchedulerViewProps['onEventDblClick']>,
    },
    onDateClick: {
      type: Function as PropType<UiSchedulerViewProps['onDateClick']>,
    },
    onDateDblClick: {
      type: Function as PropType<UiSchedulerViewProps['onDateDblClick']>,
    },
    onViewChange: {
      type: Function as PropType<UiSchedulerViewProps['onViewChange']>,
    },
    onSelectRange: {
      type: Function as PropType<UiSchedulerViewProps['onSelectRange']>,
    },
    onRangeChange: {
      type: Function as PropType<UiSchedulerViewProps['onRangeChange']>,
    },
    onMoreEventsClick: {
      type: Function as PropType<UiSchedulerViewProps['onMoreEventsClick']>,
    },
    onEventHover: {
      type: Function as PropType<UiSchedulerViewProps['onEventHover']>,
    },
    eventContent: {
      type: Function as PropType<UiSchedulerViewProps['eventContent']>,
    },
    eventClassName: {
      type: Function as PropType<UiSchedulerViewProps['eventClassName']>,
    },
  },
  setup(props) {
    const instance = shallowRef<any>()
    const dataSource = ref(mapUiEventsToEj2(props.events))

    const restore = () => {
      dataSource.value = mapUiEventsToEj2(props.events)
      instance.value?.refreshEvents?.()
    }

    const visibleRangeOf = () => {
      const dates = instance.value?.getCurrentViewDates?.() ?? []
      if (!dates.length) return null
      return { start: dates[0] as Date, end: dates[dates.length - 1] as Date }
    }

    const controller: UiSchedulerController = {
      ...createNoopSchedulerController(),
      refresh: (events) => {
        dataSource.value = mapUiEventsToEj2(events ?? props.events)
        instance.value?.refreshEvents?.()
      },
      goToDate: (date) => {
        instance.value?.changeDate?.(date instanceof Date ? date : new Date(date))
      },
      setView: (view) => {
        instance.value?.changeView?.(ej2CurrentViewOf(view))
      },
      select: (id) => {
        if (id == null) return
        instance.value?.selectedDate &&
          instance.value?.openEditor?.(
            dataSource.value.find((row: any) => String(row.Id) === String(id)),
            'Save',
          )
      },
      prev: () => {
        const inst = instance.value
        const date = inst?.activeView?.getNextPreviousDate?.('Previous')
        if (date) inst.changeDate(date)
      },
      next: () => {
        const inst = instance.value
        const date = inst?.activeView?.getNextPreviousDate?.('Next')
        if (date) inst.changeDate(date)
      },
      today: () => instance.value?.changeDate?.(new Date()),
      getVisibleRange: visibleRangeOf,
      print: () => instance.value?.print?.(),
      exportExcel: (options) => {
        const name = excelFileName(options?.fileName)
        if (instance.value?.excelExport) {
          instance.value.excelExport({ fileName: `${name}.xlsx` })
          return
        }
        downloadSchedulerExcel(props.events, options)
      },
    }

    onMounted(() => props.onReady?.(controller))

    watch(
      () => props.events,
      () => {
        dataSource.value = mapUiEventsToEj2(props.events)
      },
      { deep: true },
    )

    return () => {
      const grouped = usesTimelineOrResources(props)
      const height =
        typeof props.height === 'number' ? `${props.height}px` : props.height
      const eventTemplate = props.eventContent
        ? (data: any) => props.eventContent!(ej2RecordToUiEvent(data))
        : undefined
      return h(
        'div',
        {
          class: schedulerHookClass('mmda-scheduler', props.readonly),
          ...htmlAttributesOf(props as any),
        },
        [
          h(ScheduleImpl, {
            ref: (el: any) => {
              instance.value = el?.ej2Instances ?? el
            },
            height,
            locale: props.locale,
            selectedDate: props.selectedDate
              ? new Date(props.selectedDate as any)
              : new Date(),
            currentView: ej2CurrentViewOf(props.view),
            firstDayOfWeek: props.firstDayOfWeek,
            workDays: schedulerWorkDaysOf(props.workDays),
            showWeekend: props.showWeekend !== false,
            workHours: schedulerWorkHoursOf(props),
            startHour: props.startHour ?? '00:00',
            endHour: props.endHour ?? '24:00',
            timeScale: schedulerTimeScaleOf(props.slotDuration),
            showTimeIndicator: !!props.showNowIndicator,
            minDate: props.minDate ? new Date(props.minDate as any) : undefined,
            maxDate: props.maxDate ? new Date(props.maxDate as any) : undefined,
            allowDragAndDrop: !props.readonly && props.allowDrag !== false,
            allowResizing: !props.readonly && props.allowResize !== false,
            allowOverlap: props.allowOverlap !== false,
            showHeaderBar: props.showHeader !== false,
            showQuickInfo: props.showQuickInfo !== false,
            hideEmptyAgendaDays: !!props.hideEmptyAgendaDays,
            showWeekNumber: !!props.showWeekNumber,
            agendaDaysCount: props.dayCount,
            views: props.dayCount
              ? [{ option: ej2CurrentViewOf(props.view), interval: props.dayCount }]
              : undefined,
            readonly: props.readonly,
            eventSettings: {
              dataSource: dataSource.value,
              allowAdding: !props.readonly && props.allowAdd !== false,
              template: eventTemplate,
              fields: {
                id: { name: 'Id' },
                subject: { name: 'Subject' },
                startTime: { name: 'StartTime' },
                endTime: { name: 'EndTime' },
                isAllDay: { name: 'IsAllDay' },
                location: { name: 'Location' },
                description: { name: 'Description' },
                recurrenceRule: { name: 'RecurrenceRule' },
                recurrenceException: { name: 'RecurrenceException' },
              },
            },
            group: grouped ? { resources: ['Owners'] } : undefined,
            resources: grouped
              ? [
                  {
                    field: 'OwnerId',
                    title: 'Owner',
                    name: 'Owners',
                    dataSource: mapUiResourcesToEj2(props.resources),
                    textField: 'Text',
                    idField: 'Id',
                    colorField: 'Color',
                  },
                ]
              : undefined,
            eventRendered: (args: any) => {
              const ui = ej2RecordToUiEvent(args?.data)
              const extra = props.eventClassName?.(ui)
              if (extra && args?.element) {
                args.element.classList.add(...String(extra).split(/\s+/))
              }
              if (ui.color && args?.element) {
                args.element.style.backgroundColor = ui.color
              }
            },
            actionBegin: async (args: any) => {
              const type = String(args?.requestType ?? '')
              if (type === 'eventCreate' || type === 'eventChange' || type === 'eventRemove') {
                const action =
                  type === 'eventCreate'
                    ? 'add'
                    : type === 'eventRemove'
                      ? 'delete'
                      : 'update'
                const data = [].concat(args.data ?? args.changedRecords ?? args.deletedRecords ?? [])[0]
                const ok = await emitSchedulerChange(props.onEventChange, {
                  action,
                  event: ej2RecordToUiEvent(data),
                  native: args,
                })
                if (!ok) {
                  args.cancel = true
                  restore()
                }
              }
            },
            dragStop: async (args: any) => {
              const ok = await emitSchedulerChange(props.onEventChange, {
                action: 'move',
                event: ej2RecordToUiEvent(args?.data),
                native: args,
              })
              if (!ok) {
                args.cancel = true
                restore()
              }
            },
            resizeStop: async (args: any) => {
              const ok = await emitSchedulerChange(props.onEventChange, {
                action: 'resize',
                event: ej2RecordToUiEvent(args?.data),
                native: args,
              })
              if (!ok) {
                args.cancel = true
                restore()
              }
            },
            eventClick: async (args: any) => {
              const event = ej2RecordToUiEvent(args?.event ?? args?.data)
              const ok = await emitSchedulerEventClick(props.onEventClick, event)
              if (!ok) {
                args.cancel = true
                return
              }
              openSchedulerEventUrl(event)
            },
            eventDoubleClick: (args: any) => {
              props.onEventDblClick?.(ej2RecordToUiEvent(args?.event ?? args?.data))
            },
            cellClick: (args: any) => {
              if (!props.allowSelect) {
                props.onDateClick?.(args?.startTime ?? args?.start, args?.isAllDay)
              }
            },
            cellDoubleClick: (args: any) => {
              props.onDateDblClick?.(args?.startTime ?? args?.start, args?.isAllDay)
            },
            select: (args: any) => {
              if (!props.allowSelect) return
              if (props.allowSelectOverlap === false && args?.data) {
                args.cancel = true
                return
              }
              const start = args?.startTime ?? args?.start
              const end = args?.endTime ?? args?.end
              if (start && end) props.onSelectRange?.(start, end, args?.isAllDay)
            },
            navigating: (args: any) => {
              const view = uiViewOfEj2(args?.currentView ?? args?.action)
              const date = args?.currentDate ?? new Date()
              if (args?.action === 'view') props.onViewChange?.(view, date)
              const range = visibleRangeOf()
              if (range) props.onRangeChange?.(range.start, range.end)
            },
            moreEventsClick: (args: any) => {
              const date = args?.date ?? args?.startTime
              const events = [].concat(args?.eventData ?? []).map(ej2RecordToUiEvent)
              props.onMoreEventsClick?.(date, events)
            },
            eventMouseEnter: (args: any) => {
              props.onEventHover?.(ej2RecordToUiEvent(args?.data ?? args?.event))
            },
            eventMouseLeave: () => {
              props.onEventHover?.(null)
            },
          }),
        ],
      )
    }
  },
})

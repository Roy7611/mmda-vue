import {
  defineComponent,
  h,
  onMounted,
  render,
  shallowRef,
  watch,
  type PropType,
} from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import rrulePlugin from '@fullcalendar/rrule'
import {
  createNoopSchedulerController,
  downloadSchedulerExcel,
  emitSchedulerChange,
  emitSchedulerEventClick,
  htmlAttributesOf,
  openSchedulerEventUrl,
  schedulerHookClass,
  type UiSchedulerController,
  type UiSchedulerEvent,
  type UiSchedulerView,
  type UiSchedulerViewProps,
} from '@mmda/vui'
import {
  fcCalendarOptionsOf,
  fcEventToUi,
  fcInitialViewOf,
  mapUiEventToFc,
  uiViewOfFc,
} from './fc_map'

export const FcScheduler = defineComponent({
  name: 'FcScheduler',
  props: {
    events: { type: Array as PropType<UiSchedulerEvent[]>, default: () => [] },
    selectedDate: { type: [String, Date] as PropType<string | Date> },
    view: { type: String as PropType<UiSchedulerView>, default: 'week' },
    height: { type: [String, Number], default: '650px' },
    readonly: { type: Boolean, default: false },
    allowDrag: { type: Boolean, default: true },
    allowResize: { type: Boolean, default: true },
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
    showWeekNumber: { type: Boolean, default: false },
    dayCount: { type: Number },
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
    const host = shallowRef<any>()
    const apiOf = () => host.value?.getApi?.()

    const controller: UiSchedulerController = {
      ...createNoopSchedulerController(),
      refresh: (events) => {
        const api = apiOf()
        api?.removeAllEvents()
        for (const event of events ?? props.events ?? []) {
          api?.addEvent(mapUiEventToFc(event))
        }
      },
      goToDate: (date) => {
        apiOf()?.gotoDate(date instanceof Date ? date : new Date(date))
      },
      setView: (view) => {
        apiOf()?.changeView(fcInitialViewOf(view))
      },
      select: (id) => {
        if (id == null) {
          apiOf()?.unselect()
          return
        }
        apiOf()?.getEventById(String(id))?.setProp('classNames', ['mmda-scheduler-selected'])
      },
      prev: () => apiOf()?.prev(),
      next: () => apiOf()?.next(),
      today: () => apiOf()?.today(),
      getVisibleRange: () => {
        const view = apiOf()?.view
        if (!view) return null
        return { start: view.activeStart, end: view.activeEnd }
      },
      print: () => {
        const el = host.value?.$el ?? host.value?.el
        if (typeof window !== 'undefined') window.print()
        void el
      },
      exportExcel: (options) => {
        downloadSchedulerExcel(props.events, options)
      },
    }

    onMounted(() => props.onReady?.(controller))

    watch(
      () => props.events,
      () => controller.refresh(props.events),
      { deep: true },
    )

    return () => {
      const mapped = fcCalendarOptionsOf(props)
      const height =
        typeof props.height === 'number' ? props.height : props.height
      return h(
        'div',
        {
          class: schedulerHookClass('mmda-fc-scheduler', props.readonly),
          onDblclick: (ev: MouseEvent) => {
            const target = ev.target as HTMLElement | null
            if (target?.closest('.fc-event')) return
            props.onDateDblClick?.(apiOf()?.getDate?.() ?? new Date())
          },
          ...htmlAttributesOf(props as any),
        },
        [
          h(FullCalendar as any, {
            ref: (el: any) => {
              host.value = el
            },
            options: {
              plugins: [
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
                multiMonthPlugin,
                rrulePlugin,
              ],
              locale: props.locale,
              height,
              events: (props.events ?? []).map(mapUiEventToFc),
              ...mapped,
              eventClick: async (info: any) => {
                info.jsEvent?.preventDefault?.()
                const event = fcEventToUi(info.event)
                const ok = await emitSchedulerEventClick(props.onEventClick, event)
                if (!ok) return
                openSchedulerEventUrl(event)
              },
              eventDrop: async (info: any) => {
                const ok = await emitSchedulerChange(props.onEventChange, {
                  action: 'move',
                  event: fcEventToUi(info.event),
                  native: info,
                })
                if (!ok) info.revert()
              },
              eventResize: async (info: any) => {
                const ok = await emitSchedulerChange(props.onEventChange, {
                  action: 'resize',
                  event: fcEventToUi(info.event),
                  native: info,
                })
                if (!ok) info.revert()
              },
              dateClick: (info: any) => {
                props.onDateClick?.(info.date, info.allDay)
              },
              select: (info: any) => {
                props.onSelectRange?.(info.start, info.end, info.allDay)
              },
              datesSet: (info: any) => {
                props.onRangeChange?.(info.start, info.end)
                props.onViewChange?.(uiViewOfFc(info.view?.type), info.start)
              },
              moreLinkClick: (info: any) => {
                const events = (info.allSegs ?? info.hiddenSegs ?? [])
                  .map((seg: any) => fcEventToUi(seg.event ?? seg))
                props.onMoreEventsClick?.(info.date, events)
                return 'popover'
              },
              eventMouseEnter: (info: any) => {
                props.onEventHover?.(fcEventToUi(info.event))
              },
              eventMouseLeave: () => {
                props.onEventHover?.(null)
              },
              eventClassNames: (arg: any) => {
                const extra = props.eventClassName?.(fcEventToUi(arg.event))
                return extra ? String(extra).split(/\s+/) : []
              },
              eventContent: props.eventContent
                ? (arg: any) => {
                    const wrap = document.createElement('div')
                    render(props.eventContent!(fcEventToUi(arg.event)), wrap)
                    return { domNodes: Array.from(wrap.childNodes) }
                  }
                : undefined,
            },
          }),
        ],
      )
    }
  },
})

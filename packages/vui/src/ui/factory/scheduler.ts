/*
 * 排程是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setSchedulerPlugin(createSfSchedulerPlugin()) 或 createFcSchedulerPlugin()。
 * 不是 factory.calendar（月视选日），也不是 gantt。
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiSchedulerPlugin as CorePlugin } from '@mmda/core'

export type {
  UiSchedulerView,
  UiSchedulerEventDisplay,
  UiSchedulerEvent,
  UiSchedulerResource,
  UiSchedulerChangeAction,
  UiSchedulerChangeEvent,
  UiSchedulerVisibleRange,
  UiSchedulerExportExcelOptions,
  UiSchedulerController,
  UiSchedulerWorkHours,
  UiSchedulerViewProps,
  UiSchedulerPlugin,
} from '@mmda/core'

export {
  UI_SCHEDULER_TIMELINE_VIEWS,
  SCHEDULER_PLUGIN_NOT_INSTALLED,
  SCHEDULER_TIMELINE_NOT_SUPPORTED,
  unimplementedSchedulerPlugin,
  schedulerHookClass,
  schedulerWorkDaysOf,
  schedulerSlotDurationOf,
  schedulerSlotDurationHms,
  schedulerHourHms,
  isSchedulerTimelineView,
  schedulerHiddenDaysOf,
  emitSchedulerChange,
  emitSchedulerEventClick,
  openSchedulerEventUrl,
  schedulerEventsToCsv,
  downloadSchedulerExcel,
  excelFileName,
  createNoopSchedulerController,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueSchedulerPlugin = CorePlugin<VNode>

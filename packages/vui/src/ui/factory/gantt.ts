/*
 * 甘特是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setGanttPlugin(createSfGanttPlugin()) 等。
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiGanttPlugin as CorePlugin } from '@mmda/core'

export type {
  UiGanttTaskType,
  UiGanttViewMode,
  UiGanttTask,
  UiGanttLink,
  UiGanttColumn,
  UiGanttPrintOptions,
  UiGanttController,
  UiGanttChangeEvent,
  UiGanttViewProps,
  UiGanttChartProps,
  UiGanttPlugin,
} from '@mmda/core'

export {
  GANTT_PLUGIN_NOT_INSTALLED,
  unimplementedGanttPlugin,
  ganttHookClass,
  UI_GANTT_LINK_TYPES,
  ganttLinkTypeCode,
  applyGanttLinksToTasks,
  createNoopGanttController,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueGanttPlugin = CorePlugin<VNode>

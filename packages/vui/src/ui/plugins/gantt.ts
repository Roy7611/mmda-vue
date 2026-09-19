/*
 * 甘特是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(createSfGanttPlugin())。
 * 契约在 @mmda/core ui/plugins。
 */
import type { VNode } from 'vue'
import type { UiGanttPlugin as CorePlugin } from '@mmda/core'

export type {
  UiGanttTaskType,
  UiGanttTimeScale,
  UiGanttTask,
  UiGanttLink,
  UiGanttColumn,
  UiGanttPrintOptions,
  UiGanttController,
  UiGanttChangeEventArgs,
  UiGanttProps,
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

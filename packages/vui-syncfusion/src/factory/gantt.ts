/*
 * 甘特是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setGanttPlugin(createSfGanttPlugin())
 */
import { h } from 'vue'
import type { UiGanttPlugin, UiGanttViewProps } from '@mmda/vui'
import { SfGanttChart } from '../components/SfGanttChart'

export {
  GANTT_VIEW_MODES,
  ej2RecordToUiTask,
  mapUiTasksToEj2,
} from '../components/SfGanttChart'

export function createSfGanttPlugin(): UiGanttPlugin {
  return {
    ganttView: (props: UiGanttViewProps) => h(SfGanttChart, props as any),
  }
}

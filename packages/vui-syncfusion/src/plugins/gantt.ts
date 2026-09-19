/*
 * 甘特是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(createSfGanttPlugin())
 */
import { h } from 'vue'
import { UiPluginName, type UiPlugin, type UiGanttProps } from '@mmda/vui'
import { SfGanttChart } from '../components/SfGanttChart'

export {
  GANTT_VIEW_MODES,
  ej2RecordToUiTask,
  mapUiTasksToEj2,
} from '../components/SfGanttChart'

export function createSfGanttPlugin(): UiPlugin {
  return {
    name: UiPluginName.gantt,
    buildUi(_context, props) {
      return h(SfGanttChart, props as UiGanttProps as any)
    },
  }
}

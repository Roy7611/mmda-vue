/*
 * 排程是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setSchedulerPlugin(createSfSchedulerPlugin())
 */
import { h } from 'vue'
import type { UiSchedulerPlugin, UiSchedulerViewProps } from '@mmda/vui'
import { SfScheduler } from '../components/SfScheduler'

export {
  EJ2_SCHEDULER_VIEWS,
  ej2RecordToUiEvent,
  mapUiEventsToEj2,
  mapUiResourcesToEj2,
  schedulerTimeScaleOf,
} from './schedule_map'

export function createSfSchedulerPlugin(): UiSchedulerPlugin {
  return {
    schedulerView: (props: UiSchedulerViewProps) =>
      h(SfScheduler, props as any),
  }
}

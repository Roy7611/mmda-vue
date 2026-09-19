import { h } from 'vue'
import {
  isSchedulerTimelineView,
  SCHEDULER_TIMELINE_NOT_SUPPORTED,
  UiPluginName,
  type UiPlugin,
  type UiSchedulerProps,
} from '@mmda/vui'
import { FcScheduler } from './FcScheduler'

export function createFcSchedulerPlugin(): UiPlugin {
  return {
    name: UiPluginName.scheduler,
    buildUi(_context, props) {
      const next = props as UiSchedulerProps
      if (isSchedulerTimelineView(next?.view)) {
        throw new Error(SCHEDULER_TIMELINE_NOT_SUPPORTED)
      }
      return h(FcScheduler, next as any)
    },
  }
}

export { FcScheduler }

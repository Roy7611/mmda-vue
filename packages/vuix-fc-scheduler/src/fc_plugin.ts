import { h } from 'vue'
import {
  isSchedulerTimelineView,
  SCHEDULER_TIMELINE_NOT_SUPPORTED,
  type UiSchedulerPlugin,
  type UiSchedulerProps,
} from '@mmda/vui'
import { FcScheduler } from './FcScheduler'

export function createFcSchedulerPlugin(): UiSchedulerPlugin {
  return {
    schedulerView: (props: UiSchedulerProps) => {
      if (isSchedulerTimelineView(props.view)) {
        throw new Error(SCHEDULER_TIMELINE_NOT_SUPPORTED)
      }
      return h(FcScheduler, props as any)
    },
  }
}

export { FcScheduler }

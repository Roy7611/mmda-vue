import { h } from 'vue'
import {
  isSchedulerTimelineView,
  SCHEDULER_TIMELINE_NOT_SUPPORTED,
  type UiSchedulerPlugin,
  type UiSchedulerViewProps,
} from '@mmda/vui'
import { FcScheduler } from './FcScheduler'

export function createFcSchedulerPlugin(): UiSchedulerPlugin {
  return {
    schedulerView: (props: UiSchedulerViewProps) => {
      if (isSchedulerTimelineView(props.view)) {
        throw new Error(SCHEDULER_TIMELINE_NOT_SUPPORTED)
      }
      return h(FcScheduler, props as any)
    },
  }
}

export { FcScheduler }

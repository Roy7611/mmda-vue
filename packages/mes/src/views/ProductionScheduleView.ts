/*
 * 生产排产（ProductionSchedule / ProductionSchedules）：甘特页的中性视图。
 */
import type { UiContext, UiViewDeps } from '@mmda/core'
import {
  mapSchedulePayload,
  rejectLockedTaskDrag,
} from '../schedule/scheduleMapper'
import { ganttScheduleView } from './GanttScheduleView'

export function productionScheduleView<TNode>(
  context: UiContext,
  deps: UiViewDeps<TNode>,
): TNode {
  return ganttScheduleView(context, deps, {
    variant: 'schedule',
    repository: 'ProductionScheduleTasks',
    loadAction: 'getAllSchedule',
    mapPayload: mapSchedulePayload,
    isTaskLocked: (task) => !rejectLockedTaskDrag(task),
    allowRowReorder: false,
    undoController: true,
  })
}

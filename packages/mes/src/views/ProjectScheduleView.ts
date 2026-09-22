/*
 * 项目排产（ProjectSchedule / ProjectSchedules）：甘特页的中性视图。
 * 与生产排产同一份实现，差异：仓储/action、允许拖行排序、锁定判断多一条项目规则。
 */
import type { UiContext, UiViewDeps } from '@mmda/core'
import { isProjectScheduleTaskLocked } from '../components/GanntView/ganttProjectScheduleLockHelpers'
import {
  mapProductionLink,
  mapProjectTask,
  rejectLockedTaskDrag,
} from '../schedule/scheduleMapper'
import { ganttScheduleView } from './GanttScheduleView'

export function projectScheduleView<TNode>(
  context: UiContext,
  deps: UiViewDeps<TNode>,
): TNode {
  return ganttScheduleView(context, deps, {
    variant: 'project',
    repository: 'ProjectScheduleTasks',
    loadAction: 'getAllProjectSchedule',
    mapPayload: (list) => {
      const value = list as { tasks?: unknown[]; links?: unknown[] } | unknown[]
      const tasks = Array.isArray(value)
        ? value
        : ((value?.tasks ?? []) as unknown[])
      const links = Array.isArray(value) ? [] : ((value?.links ?? []) as unknown[])
      return {
        tasks: tasks.map((item) => mapProjectTask(item)),
        links: links.map((item) => mapProductionLink(item)),
      }
    },
    isTaskLocked: (task) =>
      !rejectLockedTaskDrag(task) || isProjectScheduleTaskLocked(task),
    allowRowReorder: true,
  })
}

import {
  applyScheduleGanttTaskDates,
  persistScheduleGanttTaskExpectedDates,
} from '../components/GanntView/ganttScheduleDateHelpers'
import { isProjectScheduleTaskLocked } from '../components/GanntView/ganttProjectScheduleLockHelpers'
import type { UiGanttLink, UiGanttTask } from '@mmda/vui'

export function toGanttTaskId(id: unknown) {
  return id === 0 || id === '0' ? 'project_0' : id
}

export function dayDuration(start?: Date | null, end?: Date | null) {
  if (!start || !end) return undefined
  const days = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, days)
}

export function mapProductionTask(item: any): UiGanttTask {
  applyScheduleGanttTaskDates(item, {
    calculateDuration: (start, end) => dayDuration(start, end) ?? 1,
  })
  const locked = isProjectScheduleTaskLocked(item)
  return {
    ...item,
    id: toGanttTaskId(item.taskID ?? item.id),
    name: item.productName ?? item.projectName ?? item.text ?? item.name,
    startDate: item.start_date ?? item.expectedStart,
    endDate: item.end_date ?? item.expectedFinish,
    duration: item.duration ?? item.expectedDuration,
    parentId:
      item.parentTaskID === undefined || item.parentTaskID === null || item.parentTaskID === ''
        ? null
        : toGanttTaskId(item.parentTaskID),
    progress: item.progress ?? 0,
    type: item.milestone ? 'milestone' : 'task',
    readonly: locked || item.readonly,
    color: item.color ?? (item.taskColor ? `#${item.taskColor}` : undefined),
  }
}

export function mapProductionLink(item: any): UiGanttLink {
  return {
    ...item,
    id: item.relationID ?? item.id,
    source: toGanttTaskId(item.fromTaskID ?? item.source),
    target: toGanttTaskId(item.toTaskID ?? item.target),
    type: item.relationType ?? item.type ?? 'FS',
  }
}

export function mapSchedulePayload(list: any) {
  const tasks = (list?.tasks ?? list ?? []).map(mapProductionTask)
  const links = (list?.links ?? []).map(mapProductionLink)
  return { tasks, links }
}

export function mapProjectTask(item: any): UiGanttTask {
  const mapped = mapProductionTask(item)
  mapped.name =
    item.taskName ?? item.wbsName ?? item.projectName ?? mapped.name
  return mapped
}

export function ganttTaskToSavePayload(task: UiGanttTask) {
  const payload: any = { ...task }
  persistScheduleGanttTaskExpectedDates(
    {
      ...payload,
      start_date: task.startDate,
      end_date: task.endDate,
    },
    {
      calculateDuration: (start, end) => dayDuration(start, end) ?? 1,
    },
  )
  payload.taskID = task.id === 'project_0' ? 0 : task.id
  payload.parentTaskID = task.parentId === 'project_0' ? 0 : task.parentId
  payload.expectedStart = payload.expectedStart
  payload.expectedFinish = payload.expectedFinish
  payload.expectedDuration = task.duration
  return payload
}

export function ganttLinkToSavePayload(link: UiGanttLink) {
  return {
    ...link,
    fromTaskID: link.source,
    toTaskID: link.target,
    relationID: link.id,
    relationType: link.type,
    refName: 'ProductionTaskRelation',
  }
}

export function rejectLockedTaskDrag(task: UiGanttTask | undefined) {
  if (!task) return false
  return !task.readonly && !isProjectScheduleTaskLocked(task)
}

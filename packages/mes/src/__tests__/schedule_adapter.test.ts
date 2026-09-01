import { describe, expect, it } from 'vitest'
import '@mmda/core'
import {
  ganttLinkToSavePayload,
  ganttTaskToSavePayload,
  mapProductionLink,
  mapProductionTask,
  mapSchedulePayload,
  rejectLockedTaskDrag,
  toGanttTaskId,
} from '../schedule/scheduleMapper'
import { ManualTaskStatus } from '@mmda/base/src/enums/ManualTaskStatus'

describe('schedule gantt adapter', () => {
  it('maps task and link ids without colliding with root 0', () => {
    expect(toGanttTaskId(0)).toBe('project_0')
    const task = mapProductionTask({
      taskID: 8,
      productName: 'Cut',
      expectedStart: '2026-01-01',
      expectedFinish: '2026-01-05',
      parentTaskID: 0,
      milestone: false,
    })
    expect(task.id).toBe(8)
    expect(task.name).toBe('Cut')
    expect(task.parentId).toBe('project_0')
    const link = mapProductionLink({
      relationID: 3,
      fromTaskID: 8,
      toTaskID: 9,
      relationType: 'FS',
    })
    expect(link.source).toBe(8)
    expect(link.target).toBe(9)
  })

  it('rejects dragging finished or cancelled tasks', () => {
    const locked = mapProductionTask({
      taskID: 1,
      productName: 'Done',
      refName: 'ProductionTask',
      status: ManualTaskStatus.FINISHED,
    })
    expect(rejectLockedTaskDrag(locked)).toBe(false)
    expect(
      rejectLockedTaskDrag(
        mapProductionTask({ taskID: 2, productName: 'Open', refName: 'ProductionTask' }),
      ),
    ).toBe(true)
  })

  it('rolls save payloads back to schedule API fields', () => {
    const payload = ganttTaskToSavePayload({
      id: 8,
      name: 'Cut',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      duration: 4,
      parentId: 'project_0',
    })
    expect(payload.taskID).toBe(8)
    expect(payload.parentTaskID).toBe(0)
    expect(ganttLinkToSavePayload({ source: 1, target: 2, type: 'SS', id: 9 }).fromTaskID).toBe(1)
  })

  it('maps getAllSchedule list envelopes', () => {
    const mapped = mapSchedulePayload({
      tasks: [{ taskID: 1, productName: 'A', expectedStart: '2026-01-01' }],
      links: [{ relationID: 2, fromTaskID: 1, toTaskID: 3, relationType: 'FS' }],
    })
    expect(mapped.tasks[0].name).toBe('A')
    expect(mapped.links[0].id).toBe(2)
  })
})

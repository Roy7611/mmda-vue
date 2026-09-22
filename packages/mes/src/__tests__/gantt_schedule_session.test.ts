import { describe, expect, it, vi } from 'vitest'
import type { ApiClient, UiGanttController } from '@mmda/core'
import { mapSchedulePayload } from '../schedule/scheduleMapper'
import {
  GanttScheduleSession,
} from '../schedule/ganttScheduleSession'

interface Calls {
  getAll: Array<Record<string, unknown>>
  doAction: Array<{ action?: string; body?: unknown }>
  refreshed: number
  errors: unknown[]
}

function harness(overrides: Partial<GanttScheduleSessionOptions> = {}) {
  const calls: Calls = { getAll: [], doAction: [], refreshed: 0, errors: [] }
  const rows = [
    { taskID: 1, productName: 'Cut', expectedStart: '2026-01-01', expectedFinish: '2026-01-03' },
    { taskID: 2, productName: 'Weld', expectedStart: '2026-01-04', expectedFinish: '2026-01-06' },
  ]
  const apiClient = {
    getAll: (param: Record<string, unknown>) => {
      calls.getAll.push(param)
      return Promise.resolve({ list: { tasks: rows, links: [] } })
    },
    doAction: (param: { action?: string }, body: unknown) => {
      calls.doAction.push({ action: param.action, body })
      return Promise.resolve(true)
    },
  } as unknown as ApiClient
  const controller = {
    refresh: () => {
      calls.refreshed += 1
    },
    setViewMode: vi.fn(),
    fitToProject: vi.fn(),
    undo: vi.fn(),
  } as unknown as UiGanttController
  const session = new GanttScheduleSession({
    apiClient,
    repository: 'ProductionScheduleTasks',
    service: 'mes',
    loadAction: 'getAllSchedule',
    // 用真实映射器：生产排产的 task/link → 甘特契约。
    mapPayload: mapSchedulePayload,
    onError: (error) => calls.errors.push(error),
    onChanged: () => undefined,
    ...overrides,
  })
  return { session, calls, controller, apiClient }
}

describe('GanttScheduleSession（排产甘特的业务逻辑，无框架）', () => {
  it('挂上 controller 就取数：按 action/仓储拼请求，数据交给 controller.refresh', async () => {
    const { session, calls, controller } = harness()
    session.attach(controller)
    expect(session.loading).toBe(true)
    await vi.waitFor(() => expect(session.loading).toBe(false))

    expect(calls.getAll).toEqual([
      { action: 'getAllSchedule', repository: 'ProductionScheduleTasks', service: 'mes' },
    ])
    expect(session.tasks.map((task) => task.id)).toEqual([1, 2])
    expect(calls.refreshed).toBe(1)
  })

  it('只加载一次：重复 attach 不会重复取数', async () => {
    const { session, calls, controller } = harness()
    session.attach(controller)
    await vi.waitFor(() => expect(session.loading).toBe(false))
    session.attach(controller)
    expect(calls.getAll).toHaveLength(1)
  })

  it('拖动成功：先保存再整体重取，返回 true', async () => {
    const { session, calls, controller } = harness()
    session.attach(controller)
    await vi.waitFor(() => expect(session.loading).toBe(false))

    const ok = await session.changeTask({ task: session.tasks[0] })

    expect(ok).toBe(true)
    expect(calls.doAction[0]?.action).toBe('saveAndGetAll')
    expect(calls.getAll).toHaveLength(2)
  })

  it('锁定行不许拖：不发请求、回滚、返回 false', async () => {
    const { session, calls, controller } = harness({
      isTaskLocked: () => true,
    })
    session.attach(controller)
    await vi.waitFor(() => expect(session.loading).toBe(false))
    const before = calls.getAll.length

    const ok = await session.changeTask({ task: session.tasks[0] })

    expect(ok).toBe(false)
    expect(calls.doAction).toHaveLength(0)
    expect(calls.getAll).toHaveLength(before)
    expect(session.tasks).toHaveLength(2)
  })

  it('保存失败：报错 + 回滚，返回 false', async () => {
    const { session, calls, controller, apiClient } = harness()
    session.attach(controller)
    await vi.waitFor(() => expect(session.loading).toBe(false))
    calls.doAction.length = 0
    apiClient.doAction = () => Promise.reject(new Error('500'))

    const ok = await session.changeTask({ task: session.tasks[0] })

    expect(ok).toBe(false)
    expect(calls.errors).toHaveLength(1)
    expect(session.tasks).toHaveLength(2)
  })

  it('撤销回到快照；时间粒度转发给 controller', async () => {
    const { session, controller } = harness()
    session.attach(controller)
    await vi.waitFor(() => expect(session.loading).toBe(false))

    session.tasks = []
    session.restore()
    expect(session.tasks.map((task) => task.id)).toEqual([1, 2])

    session.setViewMode('month')
    expect(session.viewMode).toBe('month')
    expect(controller.setViewMode).toHaveBeenCalledWith('month')
  })
})

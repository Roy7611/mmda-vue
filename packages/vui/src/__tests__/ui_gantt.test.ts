import { describe, expect, it } from 'vitest'
import {
  applyGanttLinksToTasks,
  createNoopGanttController,
  ganttLinkTypeCode,
  type UiGanttChartProps,
  type UiGanttViewProps,
  type UiGanttTask,
} from '../ui/ui_gantt'
import { AbstractUiBuilder, createStubUiBuilder } from '../ui/ui_builder'

describe('ui gantt contract', () => {
  it('maps link types and predecessor strings', () => {
    expect(ganttLinkTypeCode(0)).toBe('FS')
    expect(ganttLinkTypeCode('SS')).toBe('SS')
    const tasks: UiGanttTask[] = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ]
    const linked = applyGanttLinksToTasks(tasks, [
      { id: 'l1', source: 1, target: 2, type: 0 },
    ])
    expect(linked.find(t => t.id === 2)?.dependency).toBe('1FS')
  })

  it('renders a stub gantt when no skin override exists', () => {
    const vnode = AbstractUiBuilder.prototype.buildGanttView.call(
      {} as AbstractUiBuilder,
      {} as any,
      { tasks: [{ id: 1, name: 'Cut' }] },
    )
    expect(vnode.props?.class).toBe('mmda-gantt-stub')
    expect((vnode.children as any)?.[0]?.children).toContain('1 tasks')
  })

  it('stub builder exposes buildGanttView and a no-op controller', () => {
    const stub = createStubUiBuilder()
    expect(typeof stub.buildGanttView).toBe('function')
    expect(stub.buildGanttView({} as any, {} as UiGanttViewProps).type).toBe('div')
    expect(stub.buildGanttChart({} as any, {} as UiGanttChartProps).type).toBe('div')
    const controller = createNoopGanttController()
    controller.refresh()
    controller.setViewMode('week')
    expect(controller.undo).toBeTypeOf('function')
  })
})

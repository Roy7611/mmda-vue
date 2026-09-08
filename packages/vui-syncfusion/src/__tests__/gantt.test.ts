import { describe, expect, it } from 'vitest'
import { GANTT_PLUGIN_NOT_INSTALLED } from '@mmda/vui'
import { SyncfusionUiBuilder } from '../syncfusion_builder'
import {
  createSfGanttPlugin,
  GANTT_VIEW_MODES,
  mapUiTasksToEj2,
} from '../factory/gantt'

describe('createSfGanttPlugin', () => {
  it('maps unified gantt tasks onto EJ2 fields and view modes', () => {
    const rows = mapUiTasksToEj2(
      [
        { id: 1, name: 'Cut', startDate: '2026-01-01', parentId: null, type: 'task' },
        { id: 2, name: 'Pack', startDate: '2026-01-02', parentId: 1, type: 'milestone' },
      ],
      [{ source: 1, target: 2, type: 'FS' }],
    )
    expect(rows[1].Predecessor).toBe('1FS')
    expect(rows[1].Milestone).toBe(true)
    expect(rows[0].TaskName).toBe('Cut')
    expect(GANTT_VIEW_MODES.week.timelineViewMode).toBe('Week')
  })

  it('renders ganttView host with tasks', () => {
    const plugin = createSfGanttPlugin()
    const vnode = plugin.ganttView({
      tasks: [{ id: 1, name: 'Cut' }],
      readonly: true,
    })
    expect(vnode.props?.tasks).toEqual([{ id: 1, name: 'Cut' }])
    expect(vnode.props?.readonly).toBe(true)
  })

  it('throws until setGanttPlugin on the skin builder', () => {
    const builder = new SyncfusionUiBuilder()
    expect(() =>
      builder.buildGanttView({} as any, { tasks: [{ id: 1, name: 'Cut' }] }),
    ).toThrow(GANTT_PLUGIN_NOT_INSTALLED)
    builder.setGanttPlugin(createSfGanttPlugin())
    const vnode = builder.buildGanttView({} as any, {
      tasks: [{ id: 1, name: 'Cut' }],
      readonly: true,
    })
    expect(vnode.props?.readonly).toBe(true)
  })
})

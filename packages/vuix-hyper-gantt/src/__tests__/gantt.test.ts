import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { createHyperGanttPlugin } from '../hyper_plugin'
import {
  completedFinishOf,
  hourWidthOf,
  hyperItemsToVui,
  hyperSettingsOf,
  printSettingsOf,
  projectRangeOf,
  scalesOf,
  vuiTasksToHyper,
} from '../hyper_map'

describe('vuiTasksToHyper', () => {
  it('maps tree, progress, links and lag', () => {
    const items = vuiTasksToHyper(
      [
        {
          id: 1,
          name: 'Cut',
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-01-11T00:00:00Z',
          progress: 50,
          assignments: 'A [50%]',
          expanded: false,
        },
        {
          id: 2,
          name: 'Pack',
          parentId: 1,
          startDate: '2026-01-02T00:00:00Z',
          type: 'milestone',
          color: '#f00',
        },
      ],
      [{ source: 1, target: 2, type: 'FS', lag: 3600000 }],
    )
    expect(items[0].content).toBe('Cut')
    expect(items[0].indentation).toBe(0)
    expect(items[0].isExpanded).toBe(false)
    expect(items[0].assignmentsContent).toBe('A [50%]')
    expect(completedFinishOf({
      id: 1,
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-01-11T00:00:00Z',
      progress: 50,
    })?.toISOString()).toBe('2026-01-06T00:00:00.000Z')
    expect(items[1].indentation).toBe(1)
    expect(items[1].isMilestone).toBe(true)
    expect(items[1].barStyle).toContain('#f00')
    expect(items[1].predecessors?.[0].item.mmdaId).toBe(1)
    expect(items[1].predecessors?.[0].dependencyType).toBe('FS')
    expect(items[1].predecessors?.[0].lag).toBe(3600000)
  })

  it('round-trips parent and links', () => {
    const tasks = [
      { id: 'p', name: 'Parent', startDate: '2026-01-01' },
      { id: 'c', name: 'Child', parentId: 'p', startDate: '2026-01-02' },
    ]
    const links = [{ source: 'p', target: 'c', type: 'SS' }]
    const back = hyperItemsToVui(vuiTasksToHyper(tasks, links))
    expect(back.tasks.find((t) => t.id === 'c')?.parentId).toBe('p')
    expect(back.links[0]).toMatchObject({ source: 'p', target: 'c', type: 'SS' })
  })
})

describe('hyperSettingsOf', () => {
  it('maps readonly flags, scales and print options', () => {
    const settings = hyperSettingsOf({
      readonly: true,
      allowLinks: false,
      viewMode: 'day',
      gridVisible: false,
      dependencyConstraints: true,
      hourWidth: 12,
      workingWeekStart: 1,
      assignableResources: ['R1'],
      resourceHourCosts: { R1: 10 },
    })
    expect(settings.isReadOnly).toBe(true)
    expect(settings.areTaskPredecessorsReadOnly).toBe(true)
    expect(settings.isGridVisible).toBe(false)
    expect(settings.areTaskDependencyConstraintsEnabled).toBe(true)
    expect(settings.hourWidth).toBe(12)
    expect(settings.assignableResources).toEqual(['R1'])
    expect(hourWidthOf({ viewMode: 'year' })).toBeLessThan(
      hourWidthOf({ viewMode: 'day' }),
    )
    expect(scalesOf('week').some((s) => s.scaleType === 'Weeks')).toBe(true)
    expect(printSettingsOf({ title: 'Plan', rotate: true, gridVisible: false }))
      .toMatchObject({
        title: 'Plan',
        rotate: true,
        isGridVisible: false,
      })
    const range = projectRangeOf([
      { id: 1, startDate: '2026-01-02', endDate: '2026-01-10' },
      { id: 2, startDate: '2026-01-01', duration: 2 },
    ])
    expect(range.start?.toISOString().startsWith('2026-01-01')).toBe(true)
  })
})

describe('createHyperGanttPlugin', () => {
  it('renders host vnode', () => {
    const plugin = createHyperGanttPlugin({ license: 'trial' })
    const vnode = plugin.ganttView({
      tasks: [{ id: 1, name: 'Cut' }],
      readonly: true,
    })
    expect(vnode.type).toBeTruthy()
    expect(h).toBeTypeOf('function')
    expect(vnode.props?.readonly).toBe(true)
  })
})

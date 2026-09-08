import { describe, expect, it } from 'vitest'
import { kanbanHookClass } from '@mmda/vui'
import {
  createVueKanbanPlugin,
  svarCardToUi,
  uiCardToSvar,
  uiColumnsToSvar,
} from '../index'

describe('createVueKanbanPlugin', () => {
  it('maps vui cards and columns onto SVAR fields', () => {
    const row = uiCardToSvar({
      id: 1,
      title: 'Cut',
      status: 'todo',
      summary: 'First op',
      assignee: 'roy',
      dueDate: '2026-01-01',
    })
    expect(row).toMatchObject({
      id: 1,
      label: 'Cut',
      column: 'todo',
      description: 'First op',
      users: ['roy'],
      deadline: '2026-01-01',
    })
    expect(svarCardToUi(row)).toMatchObject({
      id: 1,
      title: 'Cut',
      status: 'todo',
      summary: 'First op',
      assignee: 'roy',
      dueDate: '2026-01-01',
    })
    expect(
      uiColumnsToSvar(
        [{ key: 'todo', header: 'To Do', maxCount: 3, collapsed: true }],
        false,
      ),
    ).toEqual([
      {
        id: 'todo',
        label: 'To Do',
        collapsed: true,
        cardLimit: 3,
        addCard: false,
      },
    ])
  })

  it('returns a kanbanView host', () => {
    const plugin = createVueKanbanPlugin()
    const vnode = plugin.kanbanView({
      cards: [{ id: 1, title: 'Cut', status: 'todo' }],
      columns: [{ key: 'todo', header: 'To Do' }],
      readonly: true,
    })
    expect(vnode.props?.readonly).toBe(true)
    expect(kanbanHookClass(undefined, true)).toContain('mmda-kanban--readonly')
  })
})

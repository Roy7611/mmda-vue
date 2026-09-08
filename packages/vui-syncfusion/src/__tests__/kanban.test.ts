import { describe, expect, it } from 'vitest'
import { kanbanHookClass } from '@mmda/vui'
import {
  createSfKanbanPlugin,
  ej2RecordToUiCard,
  uiCardToEj2,
  uiColumnsToEj2,
} from '../factory/kanban'

describe('createSfKanbanPlugin', () => {
  it('maps vui cards and columns onto EJ2 fields', () => {
    const row = uiCardToEj2({
      id: 1,
      title: 'Cut',
      status: 'todo',
      summary: 'First op',
      tags: ['mes', 'wip'],
      order: 2,
    })
    expect(row).toMatchObject({
      Id: 1,
      Title: 'Cut',
      Status: 'todo',
      Summary: 'First op',
      Tags: 'mes,wip',
      RankId: 2,
    })
    expect(ej2RecordToUiCard(row)).toMatchObject({
      id: 1,
      title: 'Cut',
      status: 'todo',
      summary: 'First op',
      tags: ['mes', 'wip'],
      order: 2,
    })
    expect(
      uiColumnsToEj2([
        { key: 'todo', header: 'To Do', collapsed: true, maxCount: 5 },
      ]),
    ).toEqual([
      {
        keyField: 'todo',
        headerText: 'To Do',
        allowToggle: true,
        isExpanded: false,
        maxCount: 5,
        showItemCount: true,
      },
    ])
  })

  it('returns a kanbanView host with hook class helpers', () => {
    const plugin = createSfKanbanPlugin()
    const vnode = plugin.kanbanView({
      cards: [{ id: 1, title: 'Cut', status: 'todo' }],
      columns: [{ key: 'todo', header: 'To Do' }],
      readonly: true,
    })
    expect(vnode.props?.readonly).toBe(true)
    expect(kanbanHookClass(undefined, true)).toEqual([
      'mmda-kanban',
      'mmda-kanban--readonly',
      undefined,
    ])
  })
})

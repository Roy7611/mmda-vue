import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  KANBAN_PLUGIN_NOT_INSTALLED,
  kanbanAddCardEnabled,
  kanbanDragEnabled,
  unimplementedKanbanPlugin,
  type UiKanbanPlugin,
} from '../ui/factory/kanban'
import { TestUiBuilder } from './test_builder'

describe('kanbanPlugin', () => {
  it('throws until setKanbanPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.kanbanPlugin.kanbanView({ cards: [], columns: [] })).toThrow(
      KANBAN_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedKanbanPlugin().kanbanView).toBeTypeOf('function')
  })

  it('uses the plugin after setKanbanPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiKanbanPlugin = {
      kanbanView: (props) =>
        h('div', {
          class: 'mmda-kanban',
          'data-count': props.cards?.length ?? 0,
        }),
    }
    ui.setKanbanPlugin(plugin)
    const node = ui.buildKanbanView({
      cards: [{ id: 1, title: 'A', status: 'todo' }],
      columns: [{ key: 'todo', header: 'To Do' }],
    })
    expect(node.props?.class).toBe('mmda-kanban')
    expect(node.props?.['data-count']).toBe(1)
  })

  it('disables drag when readonly and add-card unless allowed', () => {
    expect(kanbanDragEnabled({})).toBe(true)
    expect(kanbanDragEnabled({ allowDragAndDrop: false })).toBe(false)
    expect(kanbanDragEnabled({ readonly: true })).toBe(false)
    expect(kanbanAddCardEnabled({})).toBe(false)
    expect(kanbanAddCardEnabled({ allowAddCard: true })).toBe(true)
    expect(kanbanAddCardEnabled({ allowAddCard: true, readonly: true })).toBe(
      false,
    )
  })
})

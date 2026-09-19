import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  KANBAN_PLUGIN_NOT_INSTALLED,
  kanbanAddCardEnabled,
  kanbanDragEnabled,
  unimplementedKanbanPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { TestUiBuilder } from './test_builder'

describe('kanbanPlugin', () => {
  it('throws until kanban plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.buildKanban({} as any, { cards: [], columns: [] })).toThrow(
      KANBAN_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedKanbanPlugin().kanbanView).toBeTypeOf('function')
  })

  it('uses the plugin after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.kanban,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-kanban',
          'data-count': (props as { cards?: unknown[] })?.cards?.length ?? 0,
        }),
    }
    ui.use(plugin)
    const node = ui.buildKanban({} as any, {
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

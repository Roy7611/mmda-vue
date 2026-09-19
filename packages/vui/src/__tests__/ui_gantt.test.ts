import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  GANTT_PLUGIN_NOT_INSTALLED,
  applyGanttLinksToTasks,
  createNoopGanttController,
  ganttHookClass,
  ganttLinkTypeCode,
  unimplementedGanttPlugin,
  UiPluginName,
  type UiGanttTask,
  type UiPlugin,
} from '@mmda/core'
import { createStubUiBuilder } from '../ui/builder'
import { TestUiBuilder } from './test_builder'

const ganttPlugin = (render: UiPlugin['buildUi']): UiPlugin => ({
  name: UiPluginName.gantt,
  buildUi: render,
})

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
    expect(linked.find((t) => t.id === 2)?.dependency).toBe('1FS')
  })

  it('throws until gantt plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.buildGantt({} as any, { tasks: [{ id: 1 }] })).toThrow(
      GANTT_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedGanttPlugin().ganttView).toBeTypeOf('function')
  })

  it('uses the plugin after use()', () => {
    const ui = new TestUiBuilder()
    ui.use(
      ganttPlugin((_ctx, props) =>
        h('div', {
          class: 'mmda-gantt',
          'data-count': (props as { tasks?: unknown[] })?.tasks?.length ?? 0,
        }),
      ),
    )
    const node = ui.buildGanttChart({} as any, { tasks: [{ id: 1, name: 'Cut' }] })
    expect(node.props?.['data-count']).toBe(1)
  })

  it('stub builder throws until a plugin is used and exposes a no-op controller', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.buildGantt({} as any, {})).toThrow(
      GANTT_PLUGIN_NOT_INSTALLED,
    )
    stub.use(ganttPlugin(() => h('div', { class: 'mmda-gantt' })))
    expect(stub.buildGantt({} as any, {}).props?.class).toBe('mmda-gantt')
    const controller = createNoopGanttController()
    controller.refresh()
    controller.setViewMode('week')
    expect(controller.undo).toBeTypeOf('function')
    expect(controller.print).toBeTypeOf('function')
    expect(controller.exportHtml()).toBe('')
    expect(controller.getProjectXml()).toBe('')
    expect(controller.criticalTaskIds()).toEqual([])
    expect(ganttHookClass(undefined, true)).toEqual([
      'mmda-gantt',
      'mmda-gantt--readonly',
      undefined,
    ])
  })
})

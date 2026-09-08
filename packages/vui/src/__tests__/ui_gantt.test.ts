import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  GANTT_PLUGIN_NOT_INSTALLED,
  applyGanttLinksToTasks,
  createNoopGanttController,
  ganttHookClass,
  ganttLinkTypeCode,
  unimplementedGanttPlugin,
  type UiGanttPlugin,
  type UiGanttTask,
} from '../ui/factory/gantt'
import { createStubUiBuilder } from '../ui/builder/builder'
import { TestUiBuilder } from './test_builder'

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

  it('throws until setGanttPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.ganttPlugin.ganttView({})).toThrow(GANTT_PLUGIN_NOT_INSTALLED)
    expect(() => ui.buildGanttView({} as any, { tasks: [{ id: 1 }] })).toThrow(
      GANTT_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedGanttPlugin().ganttView).toBeTypeOf('function')
  })

  it('uses the plugin after setGanttPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiGanttPlugin = {
      ganttView: (props) =>
        h('div', {
          class: 'mmda-gantt',
          'data-count': props.tasks?.length ?? 0,
        }),
    }
    ui.setGanttPlugin(plugin)
    const node = ui.buildGanttChart({} as any, { tasks: [{ id: 1, name: 'Cut' }] })
    expect(node.props?.['data-count']).toBe(1)
  })

  it('stub builder throws until a plugin is set and exposes a no-op controller', () => {
    const stub = createStubUiBuilder()
    expect(() => stub.buildGanttView({} as any, {})).toThrow(
      GANTT_PLUGIN_NOT_INSTALLED,
    )
    stub.setGanttPlugin({
      ganttView: () => h('div', { class: 'mmda-gantt' }),
    })
    expect(stub.buildGanttView({} as any, {}).props?.class).toBe('mmda-gantt')
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

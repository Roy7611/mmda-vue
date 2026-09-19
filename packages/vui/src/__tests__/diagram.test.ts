import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { UiViewOne } from '../contexts/view'
import {
  DIAGRAM_PLUGIN_NOT_INSTALLED,
  UI_DIAGRAM_TYPES,
  diagramNodeDataOf,
  diagramPaletteOf,
  diagramReadonlyOf,
  unimplementedDiagramPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { TestUiBuilder } from './test_builder'

describe('diagramPlugin', () => {
  it('throws until diagram plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.buildDiagram({} as any, { diagramType: 'org' })).toThrow(
      DIAGRAM_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedDiagramPlugin().diagramView).toBeTypeOf('function')
  })

  it('uses the plugin after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.diagram,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-diagram',
          'data-type': (props as { diagramType?: string })?.diagramType,
          'data-readonly': (props as { readonly?: boolean })?.readonly
            ? '1'
            : '0',
        }),
    }
    ui.use(plugin)
    const node = ui.buildDiagram(
      { view: UiViewOne.Details } as any,
      { diagramType: 'workflow', readonly: true },
    )
    expect(node.props?.['data-type']).toBe('workflow')
    expect(node.props?.['data-readonly']).toBe('1')
  })

  it('keeps top-level types and workflow accordion groups', () => {
    expect(UI_DIAGRAM_TYPES).toEqual([
      'org',
      'workflow',
      'dataflow',
      'er',
      'uml',
    ])
    const workflow = diagramPaletteOf('workflow')
    expect(workflow.map((group) => group.id)).toEqual(['flowchart', 'bpmn'])
    expect(diagramPaletteOf('dataflow')[0]?.id).toBe('dfd')
    expect(diagramPaletteOf('uml').map((group) => group.id)).toEqual([
      'class',
      'activity',
    ])
    expect(diagramPaletteOf('org')[0]?.items.map((item) => item.shape.kind)).toEqual(
      ['dept', 'role', 'person'],
    )
  })

  it('Details and explicit readonly skip edits', () => {
    expect(diagramReadonlyOf({}, UiViewOne.Details)).toBe(true)
    expect(diagramReadonlyOf({}, UiViewOne.Edit)).toBe(false)
    expect(diagramReadonlyOf({ readonly: true }, UiViewOne.Edit)).toBe(true)
    expect(diagramReadonlyOf({ readonly: false }, UiViewOne.Details)).toBe(false)
  })

  it('merges extra node fields into data', () => {
    expect(
      diagramNodeDataOf({
        id: 'n1',
        text: 'A',
        offsetX: 1,
        data: { code: 'x' },
        owner: 'mes',
      }),
    ).toEqual({ code: 'x', owner: 'mes' })
  })
})

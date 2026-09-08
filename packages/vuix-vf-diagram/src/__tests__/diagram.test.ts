import { describe, expect, it } from 'vitest'
import { diagramPaletteOf } from '@mmda/vui'
import {
  createVueDiagramPlugin,
  vuiNodeToVueFlow,
} from '../index'

describe('createVueDiagramPlugin', () => {
  it('maps vui nodes to Vue Flow nodes', () => {
    const mapped = vuiNodeToVueFlow({
      id: 'n1',
      offsetX: 10,
      offsetY: 20,
      text: 'Start',
      shape: { family: 'bpmn', kind: 'startEvent' },
    })
    expect(mapped).toMatchObject({
      id: 'n1',
      position: { x: 10, y: 20 },
      type: 'bpmn:startEvent',
      data: { label: 'Start' },
    })
  })

  it('workflow palette has flowchart and bpmn groups', () => {
    expect(diagramPaletteOf('workflow').map((group) => group.id)).toEqual([
      'flowchart',
      'bpmn',
    ])
  })

  it('returns a diagramView host', () => {
    const plugin = createVueDiagramPlugin()
    const vnode = plugin.diagramView({
      diagramType: 'dataflow',
      readonly: true,
      nodes: [{ id: 'p1', text: 'Process' }],
    })
    expect(vnode.props?.diagramType).toBe('dataflow')
    expect(vnode.props?.readonly).toBe(true)
  })
})

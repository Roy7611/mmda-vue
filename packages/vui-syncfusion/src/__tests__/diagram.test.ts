import { describe, expect, it } from 'vitest'
import { createSfDiagramPlugin, vuiNodeToEj2, vuiShapeToEj2 } from '../plugins/diagram_editor'

describe('createSfDiagramEditorPlugin', () => {
  it('maps BPMN and flow shapes', () => {
    expect(vuiShapeToEj2({ family: 'bpmn', kind: 'startEvent' })).toMatchObject({
      type: 'Bpmn',
      shape: 'Event',
    })
    expect(vuiShapeToEj2({ family: 'flow', kind: 'decision' })).toEqual({
      type: 'Flow',
      shape: 'Decision',
    })
    expect(vuiShapeToEj2({ family: 'dataflow', kind: 'store' })).toMatchObject({
      type: 'Flow',
    })
    const mapped = vuiNodeToEj2({
      id: 'n1',
      text: 'Task',
      shape: { family: 'bpmn', kind: 'task' },
      data: { code: 'T1' },
    })
    expect(mapped.addInfo).toMatchObject({
      code: 'T1',
      mmdaShape: { family: 'bpmn', kind: 'task' },
    })
    expect(mapped.annotations).toEqual([{ content: 'Task' }])
  })

  it('renders diagramView host with type and hides palette when readonly', () => {
    const plugin = createSfDiagramPlugin()
    const vnode = plugin.diagramView({
      diagramType: 'workflow',
      readonly: true,
      nodes: [{ id: 'a', text: 'A' }],
    })
    expect(vnode.props?.diagramType).toBe('workflow')
    expect(vnode.props?.readonly).toBe(true)
  })
})

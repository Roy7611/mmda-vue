import type {
  UiDiagramConnector,
  UiDiagramNode,
} from '@mmda/vui'

export function vuiNodeToVueFlow(node: UiDiagramNode) {
  const family = node.shape?.family ?? 'org'
  const kind = node.shape?.kind ?? 'node'
  return {
    id: String(node.id),
    position: { x: node.offsetX ?? 0, y: node.offsetY ?? 0 },
    type: `${family}:${kind}`,
    data: {
      label: node.text ?? '',
      mmda: node,
    },
    draggable: true,
    width: node.width,
    height: node.height,
  }
}

export function vuiConnectorToVueFlow(connector: UiDiagramConnector) {
  return {
    id: String(connector.id),
    source: String(connector.sourceId),
    target: String(connector.targetId),
    label: connector.text,
    data: { mmda: connector },
  }
}

export function vueFlowNodeToVui(raw: {
  id: string
  position: { x: number; y: number }
  data?: { mmda?: UiDiagramNode; label?: string }
  width?: number
  height?: number
}): UiDiagramNode {
  const base = raw.data?.mmda ?? { id: raw.id }
  return {
    ...base,
    id: raw.id,
    offsetX: raw.position.x,
    offsetY: raw.position.y,
    width: raw.width ?? base.width,
    height: raw.height ?? base.height,
    text: raw.data?.label ?? base.text,
  }
}

/*
 * 图是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setDiagramPlugin(createSfDiagramPlugin()) 等。
 * 契约在 @mmda/core；v-model 式更新在本文件。
 */
import type { VNode } from 'vue'
import {
  callUiBagFn,
  type UiDiagramConnector,
  type UiDiagramNode,
  type UiDiagramPlugin as CorePlugin,
  type UiDiagramViewProps,
} from '@mmda/core'

export type {
  UiDiagramType,
  UiDiagramShapeFamily,
  UiDiagramShape,
  UiDiagramNode,
  UiDiagramConnector,
  UiDiagramPaletteItem,
  UiDiagramPaletteGroup,
  UiDiagramSelectEvent,
  UiDiagramAsideRenderer,
  UiDiagramViewProps,
  UiDiagramPlugin,
} from '@mmda/core'

export {
  DIAGRAM_PLUGIN_NOT_INSTALLED,
  UI_DIAGRAM_TYPES,
  diagramNotSupportedMessage,
  unimplementedDiagramPlugin,
  diagramHookClass,
  itemOf,
  diagramPaletteOf,
  resolveDiagramPalette,
  diagramReadonlyOf,
  diagramNodeDataOf,
  findDiagramElement,
} from '@mmda/core'

/** Vue：`onUpdate` / `onUpdate:nodes` / `onUpdate:connectors`。 */
export function emitDiagramUpdate(
  props: UiDiagramViewProps,
  nodes: UiDiagramNode[],
  connectors: UiDiagramConnector[],
): void {
  if (props.readonly) return
  callUiBagFn(props, 'onUpdate', nodes, connectors)
  props['onUpdate:nodes']?.(nodes)
  props['onUpdate:connectors']?.(connectors)
}

/** vui 钉成 VNode。 */
export type VueDiagramPlugin = CorePlugin<VNode>

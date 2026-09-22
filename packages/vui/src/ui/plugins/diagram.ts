/*
 * 图是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(createSfDiagramPlugin())。
 * 契约在 @mmda/core；v-model 式更新在本文件。
 */
import type { VNode } from 'vue'
import { vuiUpdateOf } from '../vui_props'
import {
  type UiDiagramConnector,
  type UiDiagramNode,
  type UiDiagramPlugin as CorePlugin,
  type UiDiagramProps,
} from '@mmda/core'

export type {
  UiDiagramType,
  UiDiagramShapeFamily,
  UiDiagramShape,
  UiDiagramNode,
  UiDiagramConnector,
  UiDiagramPaletteItem,
  UiDiagramPaletteGroup,
  UiDiagramSelectEventArgs,
  UiDiagramAsideRenderer,
  UiDiagramProps,
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

/**
 * 值变化：`onNodesChange` / `onConnectorsChange`（core 契约）。
 * Vue 的 `v-model:nodes` / `v-model:connectors` 糖在此收口（读袋键 `onUpdate:<name>`），不外流到契约。
 */
export function emitDiagramUpdate(
  props: UiDiagramProps,
  nodes: UiDiagramNode[],
  connectors: UiDiagramConnector[],
): void {
  if (props.readonly) return
  props.onNodesChange?.(nodes)
  props.onConnectorsChange?.(connectors)
  vuiUpdateOf<UiDiagramNode[]>(props, 'nodes')?.(nodes)
  vuiUpdateOf<UiDiagramConnector[]>(props, 'connectors')?.(connectors)
}

/** vui 钉成 VNode。 */
export type VueDiagramPlugin = CorePlugin<VNode>

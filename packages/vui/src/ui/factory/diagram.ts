/*
 * 图是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setDiagramPlugin(createSfDiagramPlugin()) 等。
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiDiagramPlugin as CorePlugin } from '@mmda/core'

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
  emitDiagramUpdate,
  findDiagramElement,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueDiagramPlugin = CorePlugin<VNode>

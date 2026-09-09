/*
 * 图是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setDiagramPlugin(createSfDiagramPlugin()) 等。
 */
import type { VNode } from 'vue'
import { callUiBagFn } from '@mmda/core'
import type { MetaUi } from '@mmda/core'
import { UiViewOne } from '../../contexts/view'
import type {UiProps} from '../layout/layout'

export type UiDiagramType = 'org' | 'workflow' | 'dataflow' | 'er' | 'uml'

export type UiDiagramShapeFamily =
  | 'org'
  | 'flow'
  | 'bpmn'
  | 'dataflow'
  | 'er'
  | 'uml'

export interface UiDiagramShape {
  family: UiDiagramShapeFamily
  kind: string
}

export interface UiDiagramNode {
  id: string | number
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
  text?: string
  shape?: UiDiagramShape
  parentId?: string | number | null
  data?: Record<string, unknown>
  [field: string]: unknown
}

export interface UiDiagramConnector {
  id: string | number
  sourceId: string | number
  targetId: string | number
  text?: string
  kind?: string
  data?: Record<string, unknown>
  [field: string]: unknown
}

export interface UiDiagramPaletteItem {
  id: string
  label: string
  shape: UiDiagramShape
}

export interface UiDiagramPaletteGroup {
  id: string
  title: string
  items: UiDiagramPaletteItem[]
}

export interface UiDiagramSelectEvent {
  id: string | number | null
  kind: 'node' | 'connector' | null
}

export type UiDiagramAsideRenderer = (
  selected: UiDiagramNode | UiDiagramConnector | null,
  kind: 'node' | 'connector' | null,
) => VNode | null

export interface UiDiagramViewProps extends UiProps {
  diagramType: UiDiagramType
  nodes?: UiDiagramNode[]
  connectors?: UiDiagramConnector[]
  palette?: UiDiagramPaletteGroup[]
  width?: string | number
  height?: string | number
  readonly?: boolean
  selectedId?: string | number | null
  nodeMetaUi?: MetaUi
  connectorMetaUi?: MetaUi
  metaUiOf?: (
    kind: 'node' | 'connector',
    element: UiDiagramNode | UiDiagramConnector,
  ) => MetaUi | undefined
  renderAside?: UiDiagramAsideRenderer
  onSelect?: (event: UiDiagramSelectEvent) => void
  onUpdate?: (nodes: UiDiagramNode[], connectors: UiDiagramConnector[]) => void
  'onUpdate:nodes'?: (nodes: UiDiagramNode[]) => void
  'onUpdate:connectors'?: (connectors: UiDiagramConnector[]) => void
}

export interface UiDiagramPlugin {
  diagramView: (props: UiDiagramViewProps) => VNode
}

export const DIAGRAM_PLUGIN_NOT_INSTALLED = 'diagram plugin not installed'

export const UI_DIAGRAM_TYPES: UiDiagramType[] = [
  'org',
  'workflow',
  'dataflow',
  'er',
  'uml',
]

export function diagramNotSupportedMessage(name: string): string {
  return `not supported: ${name}`
}

function notInstalled(): never {
  throw new Error(DIAGRAM_PLUGIN_NOT_INSTALLED)
}

export function unimplementedDiagramPlugin(): UiDiagramPlugin {
  return { diagramView: notInstalled }
}

export function diagramHookClass(
  extra?: unknown,
  readonly?: boolean,
): unknown[] {
  return [
    'mmda-diagram',
    readonly ? 'mmda-diagram--readonly' : undefined,
    extra,
  ]
}

export function itemOf(
  id: string,
  label: string,
  family: UiDiagramShapeFamily,
  kind: string,
): UiDiagramPaletteItem {
  return { id, label, shape: { family, kind } }
}

export function diagramPaletteOf(
  type: UiDiagramType,
): UiDiagramPaletteGroup[] {
  if (type === 'org') {
    return [
      {
        id: 'org',
        title: '组织',
        items: [
          itemOf('dept', '部门', 'org', 'dept'),
          itemOf('role', '岗位', 'org', 'role'),
          itemOf('person', '人员', 'org', 'person'),
        ],
      },
    ]
  }
  if (type === 'workflow') {
    return [
      {
        id: 'flowchart',
        title: '流程图',
        items: [
          itemOf('terminator', '起止', 'flow', 'terminator'),
          itemOf('process', '处理', 'flow', 'process'),
          itemOf('decision', '判断', 'flow', 'decision'),
          itemOf('document', '文档', 'flow', 'document'),
          itemOf('data', '数据', 'flow', 'data'),
        ],
      },
      {
        id: 'bpmn',
        title: 'BPMN',
        items: [
          itemOf('startEvent', '开始', 'bpmn', 'startEvent'),
          itemOf('endEvent', '结束', 'bpmn', 'endEvent'),
          itemOf('task', '任务', 'bpmn', 'task'),
          itemOf('exclusiveGateway', '排他网关', 'bpmn', 'exclusiveGateway'),
          itemOf('parallelGateway', '并行网关', 'bpmn', 'parallelGateway'),
          itemOf('dataObject', '数据对象', 'bpmn', 'dataObject'),
        ],
      },
    ]
  }
  if (type === 'dataflow') {
    return [
      {
        id: 'dfd',
        title: '数据流',
        items: [
          itemOf('external', '外部实体', 'dataflow', 'external'),
          itemOf('process', '处理', 'dataflow', 'process'),
          itemOf('store', '数据存储', 'dataflow', 'store'),
          itemOf('flow', '数据流', 'dataflow', 'flow'),
        ],
      },
    ]
  }
  if (type === 'er') {
    return [
      {
        id: 'er',
        title: 'ER',
        items: [
          itemOf('entity', '实体', 'er', 'entity'),
          itemOf('weakEntity', '弱实体', 'er', 'weakEntity'),
          itemOf('attribute', '属性', 'er', 'attribute'),
          itemOf('relationship', '联系', 'er', 'relationship'),
        ],
      },
    ]
  }
  return [
    {
      id: 'class',
      title: '类图',
      items: [
        itemOf('class', '类', 'uml', 'class'),
        itemOf('interface', '接口', 'uml', 'interface'),
        itemOf('enumeration', '枚举', 'uml', 'enumeration'),
      ],
    },
    {
      id: 'activity',
      title: '活动图',
      items: [
        itemOf('action', '动作', 'uml', 'action'),
        itemOf('decision', '判断', 'uml', 'decision'),
        itemOf('initial', '开始', 'uml', 'initial'),
        itemOf('final', '结束', 'uml', 'final'),
      ],
    },
  ]
}

export function resolveDiagramPalette(
  props: UiDiagramViewProps,
): UiDiagramPaletteGroup[] {
  return props.palette ?? diagramPaletteOf(props.diagramType)
}

export function diagramReadonlyOf(
  props: Pick<UiDiagramViewProps, 'readonly'>,
  view?: string,
): boolean {
  if (props.readonly === true) return true
  if (props.readonly === false) return false
  return view === UiViewOne.Details
}

export function diagramNodeDataOf(
  node: UiDiagramNode,
): Record<string, unknown> {
  const skip = new Set([
    'id',
    'offsetX',
    'offsetY',
    'width',
    'height',
    'text',
    'shape',
    'parentId',
    'data',
  ])
  const extra: Record<string, unknown> = { ...(node.data ?? {}) }
  for (const [key, value] of Object.entries(node)) {
    if (!skip.has(key)) extra[key] = value
  }
  return extra
}

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

export function findDiagramElement(
  props: Pick<UiDiagramViewProps, 'nodes' | 'connectors'>,
  selectedId?: string | number | null,
): {
  element: UiDiagramNode | UiDiagramConnector | null
  kind: 'node' | 'connector' | null
} {
  if (selectedId == null || selectedId === '') {
    return { element: null, kind: null }
  }
  const id = String(selectedId)
  const node = props.nodes?.find((item) => String(item.id) === id)
  if (node) return { element: node, kind: 'node' }
  const connector = props.connectors?.find((item) => String(item.id) === id)
  if (connector) return { element: connector, kind: 'connector' }
  return { element: null, kind: null }
}

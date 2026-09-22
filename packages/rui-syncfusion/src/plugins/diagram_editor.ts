import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  diagramHookClass,
  diagramNodeDataOf,
  diagramReadonlyOf,
  resolveDiagramPalette,
  UiPluginName,
  type UiDiagramConnector,
  type UiDiagramNode,
  type UiDiagramPaletteGroup,
  type UiDiagramProps,
  type UiDiagramShape,
  type UiDiagramType,
  type UiPlugin,
} from '@mmda/core'
import { joinClass, reactDomProps } from './utils'

const UML_CLASS_KINDS = new Set(['class', 'interface', 'enumeration'])
const UML_ACTIVITY_KINDS = new Set([
  'action',
  'decision',
  'initial',
  'final',
])

export function vuiShapeToEj2(shape?: UiDiagramShape): Record<string, unknown> {
  const family = shape?.family
  const kind = shape?.kind ?? 'process'
  if (family === 'bpmn') {
    if (kind === 'startEvent') {
      return { type: 'Bpmn', shape: 'Event', event: { event: 'Start' } }
    }
    if (kind === 'endEvent') {
      return { type: 'Bpmn', shape: 'Event', event: { event: 'End' } }
    }
    if (kind === 'exclusiveGateway') {
      return {
        type: 'Bpmn',
        shape: 'Gateway',
        gateway: { type: 'Exclusive' },
      }
    }
    if (kind === 'parallelGateway') {
      return {
        type: 'Bpmn',
        shape: 'Gateway',
        gateway: { type: 'Parallel' },
      }
    }
    if (kind === 'dataObject') {
      return { type: 'Bpmn', shape: 'DataObject' }
    }
    return {
      type: 'Bpmn',
      shape: 'Activity',
      activity: { activity: 'Task' },
    }
  }
  if (family === 'flow') {
    const flow: Record<string, string> = {
      terminator: 'Terminator',
      process: 'Process',
      decision: 'Decision',
      document: 'Document',
      data: 'Data',
    }
    return { type: 'Flow', shape: flow[kind] ?? 'Process' }
  }
  if (family === 'uml' && UML_CLASS_KINDS.has(kind)) {
    const classifier =
      kind === 'interface'
        ? 'Interface'
        : kind === 'enumeration'
          ? 'Enumeration'
          : 'Class'
    return { type: 'UmlClassifier', classifier }
  }
  if (family === 'uml' && UML_ACTIVITY_KINDS.has(kind)) {
    const activity: Record<string, string> = {
      action: 'Action',
      decision: 'Decision',
      initial: 'InitialNode',
      final: 'FinalNode',
    }
    return { type: 'UmlActivity', shape: activity[kind] ?? 'Action' }
  }
  if (family === 'er') {
    if (kind === 'attribute') return { type: 'Basic', shape: 'Ellipse' }
    if (kind === 'relationship') return { type: 'Basic', shape: 'Diamond' }
    return { type: 'Basic', shape: 'Rectangle' }
  }
  if (family === 'dataflow') {
    if (kind === 'external') return { type: 'Basic', shape: 'Rectangle' }
    if (kind === 'store') return { type: 'Flow', shape: 'DirectData' }
    if (kind === 'flow') return { type: 'Flow', shape: 'Data' }
    return { type: 'Basic', shape: 'Ellipse' }
  }
  return { type: 'Basic', shape: 'Rectangle' }
}

export function vuiNodeToEj2(node: UiDiagramNode): Record<string, unknown> {
  const data = diagramNodeDataOf(node)
  return {
    id: String(node.id),
    offsetX: node.offsetX ?? 100,
    offsetY: node.offsetY ?? 100,
    width: node.width ?? 100,
    height: node.height ?? 60,
    annotations: node.text ? [{ content: node.text }] : [],
    shape: vuiShapeToEj2(node.shape),
    addInfo: {
      ...data,
      mmdaShape: node.shape,
      parentId: node.parentId ?? null,
    },
  }
}

export function vuiConnectorToEj2(
  connector: UiDiagramConnector,
): Record<string, unknown> {
  return {
    id: String(connector.id),
    sourceID: String(connector.sourceId),
    targetID: String(connector.targetId),
    annotations: connector.text ? [{ content: connector.text }] : [],
    addInfo: {
      ...(connector.data ?? {}),
      mmdaKind: connector.kind,
    },
  }
}

export function paletteSymbolsOf(
  groups: UiDiagramPaletteGroup[],
): { id: string; expanded: boolean; title: string; symbols: unknown[] }[] {
  return groups.map((group) => ({
    id: group.id,
    expanded: true,
    title: group.title,
    symbols: group.items.map((item) => ({
      id: item.id,
      addInfo: { mmdaShape: item.shape },
      annotations: [{ content: item.label }],
      shape: vuiShapeToEj2(item.shape),
    })),
  }))
}

export function diagramLayoutOf(
  type: UiDiagramType,
): Record<string, unknown> | undefined {
  if (type === 'org') {
    return {
      type: 'OrganizationalChart',
      horizontalSpacing: 40,
      verticalSpacing: 40,
    }
  }
  return undefined
}

function MissingDiagram(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-diagram-missing' },
    'Diagram requires @syncfusion/ej2-react-diagrams',
  )
}

const DiagramCanvas = lazy(async (): Promise<{ default: ComponentType<any> }> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingDiagram
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-diagrams')
    return { default: mod.DiagramComponent as ComponentType<any> }
  } catch {
    return { default: MissingDiagram }
  }
})

const DiagramPalette = lazy(async (): Promise<{ default: ComponentType<any> }> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingDiagram
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-diagrams')
    return { default: mod.SymbolPaletteComponent as ComponentType<any> }
  } catch {
    return { default: MissingDiagram }
  }
})

export function SfDiagramView(props: UiDiagramProps): ReactElement {
  const groups = resolveDiagramPalette(props)
  const readonly = diagramReadonlyOf(
    props,
    String((props as any).view ?? ''),
  )

  return createElement(
    'div',
    {
      className: joinClass(diagramHookClass(props.class, readonly)),
      'data-diagram-type': props.diagramType,
      ...reactDomProps(props),
    },
    createElement(
      'div',
      { className: 'mmda-diagram-body' },
      readonly
        ? null
        : createElement(
            Suspense,
            { fallback: null },
            createElement(DiagramPalette as any, {
              palettes: paletteSymbolsOf(groups),
              width: '12rem',
              height: props.height,
            }),
          ),
      createElement(
        'div',
        { className: 'mmda-diagram-canvas' },
        createElement(
          Suspense,
          { fallback: null },
          createElement(DiagramCanvas as any, {
            width: props.width,
            height: props.height,
            nodes: (props.nodes ?? []).map(vuiNodeToEj2),
            connectors: (props.connectors ?? []).map(vuiConnectorToEj2),
            layout: diagramLayoutOf(props.diagramType),
            snapSettings: readonly ? { constraints: 0 } : undefined,
            selectionChange: (args: any) => {
              const id = args?.newValue?.[0]?.id ?? null
              const kind = args?.newValue?.[0]?.sourceID
                ? 'connector'
                : id
                  ? 'node'
                  : null
              props.onSelect?.({ id, kind: kind as 'node' | 'connector' | null })
            },
            collectionChange: () => {
              if (readonly) return
              props.onNodesChange?.((props.nodes ?? []).map((node) => ({ ...node })))
              props.onConnectorsChange?.(
                (props.connectors ?? []).map((item) => ({ ...item })),
              )
            },
          }),
        ),
      ),
    ),
  )
}

export function createSfDiagramEditorPlugin(): UiPlugin {
  return {
    name: UiPluginName.diagram,
    buildUi(_context, props) {
      return SfDiagramView(props as UiDiagramProps)
    },
  }
}

export const createSfDiagramPlugin = createSfDiagramEditorPlugin

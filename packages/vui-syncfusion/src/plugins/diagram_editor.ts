import {
  defineAsyncComponent,
  defineComponent,
  h,
  type PropType,
} from 'vue'
import type {
  UiDiagramConnector,
  UiDiagramNode,
  UiDiagramPaletteGroup,
  UiDiagramPlugin,
  UiDiagramShape,
  UiDiagramType,
  UiDiagramViewProps,
} from '@mmda/vui'
import {
  diagramHookClass,
  diagramNodeDataOf,
  emitDiagramUpdate,
  htmlAttributesOf,
  resolveDiagramPalette,
} from '@mmda/vui'

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

export function ej2NodeToVui(raw: Record<string, unknown>): UiDiagramNode {
  const info = (raw.addInfo as Record<string, unknown>) ?? {}
  const { mmdaShape, parentId, ...data } = info
  const annotations = raw.annotations as { content?: string }[] | undefined
  return {
    id: String(raw.id ?? ''),
    offsetX: Number(raw.offsetX ?? 0),
    offsetY: Number(raw.offsetY ?? 0),
    width: Number(raw.width ?? 0),
    height: Number(raw.height ?? 0),
    text: annotations?.[0]?.content,
    shape: mmdaShape as UiDiagramShape | undefined,
    parentId: (parentId as string | number | null) ?? null,
    data,
  }
}

export function ej2ConnectorToVui(
  raw: Record<string, unknown>,
): UiDiagramConnector {
  const info = (raw.addInfo as Record<string, unknown>) ?? {}
  const { mmdaKind, ...data } = info
  const annotations = raw.annotations as { content?: string }[] | undefined
  return {
    id: String(raw.id ?? ''),
    sourceId: String(raw.sourceID ?? ''),
    targetId: String(raw.targetID ?? ''),
    text: annotations?.[0]?.content,
    kind: (mmdaKind as string) ?? undefined,
    data,
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
    return { type: 'OrganizationalChart', horizontalSpacing: 40, verticalSpacing: 40 }
  }
  return undefined
}

const DiagramImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-diagrams')
    return { default: mod.DiagramComponent as any }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-sf-diagram-missing' },
            'Diagram requires @syncfusion/ej2-vue-diagrams',
          ),
      }),
    }
  }
})

const PaletteImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-diagrams')
    return { default: (mod as any).SymbolPaletteComponent }
  } catch {
    return {
      default: defineComponent({
        setup: () => () => h('div', { class: 'mmda-diagram-palette' }),
      }),
    }
  }
})

export const SfDiagramView = defineComponent({
  name: 'SfDiagramView',
  props: {
    diagramType: { type: String as PropType<UiDiagramType>, required: true },
    nodes: { type: Array as PropType<UiDiagramNode[]>, default: () => [] },
    connectors: {
      type: Array as PropType<UiDiagramConnector[]>,
      default: () => [],
    },
    palette: Array as PropType<UiDiagramPaletteGroup[]>,
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '28rem' },
    readonly: { type: Boolean, default: false },
    selectedId: { type: [String, Number] as PropType<string | number | null> },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onSelect: Function as PropType<UiDiagramViewProps['onSelect']>,
    onUpdate: Function as PropType<UiDiagramViewProps['onUpdate']>,
    'onUpdate:nodes': Function as PropType<UiDiagramViewProps['onUpdate:nodes']>,
    'onUpdate:connectors': Function as PropType<
      UiDiagramViewProps['onUpdate:connectors']
    >,
    renderAside: Function as PropType<UiDiagramViewProps['renderAside']>,
  },
  setup(props) {
    const snapshot = () => ({
      nodes: (props.nodes ?? []).map((node) => ({ ...node })),
      connectors: (props.connectors ?? []).map((item) => ({ ...item })),
    })

    return () => {
      const groups = resolveDiagramPalette(props as UiDiagramViewProps)
      const canvas = h(DiagramImpl, {
        width: props.width,
        height: props.height,
        nodes: (props.nodes ?? []).map(vuiNodeToEj2),
        connectors: (props.connectors ?? []).map(vuiConnectorToEj2),
        layout: diagramLayoutOf(props.diagramType),
        snapSettings: props.readonly ? { constraints: 0 } : undefined,
        'onSelectionChange': (args: any) => {
          const id =
            args?.newValue?.[0]?.id ??
            args?.state?.newValue?.[0]?.id ??
            null
          const kind = args?.newValue?.[0]?.sourceID
            ? 'connector'
            : id
              ? 'node'
              : null
          props.onSelect?.({ id, kind: kind as 'node' | 'connector' | null })
        },
        'onCollectionChange': () => {
          if (props.readonly) return
          emitDiagramUpdate(
            props as UiDiagramViewProps,
            snapshot().nodes,
            snapshot().connectors,
          )
        },
      })
      const palette =
        props.readonly
          ? null
          : h(PaletteImpl, {
              class: 'mmda-diagram-palette',
              palettes: paletteSymbolsOf(groups),
              width: '12rem',
              height: props.height,
            })
      const aside = h(
        'aside',
        { class: 'mmda-diagram-aside' },
        props.renderAside?.(null, null) ?? undefined,
      )
      return h(
        'div',
        {
          class: diagramHookClass(props.class, props.readonly),
          ...htmlAttributesOf(props as any),
          'data-diagram-type': props.diagramType,
        },
        [
          h(
            'div',
            { class: 'mmda-diagram-body' },
            [palette, h('div', { class: 'mmda-diagram-canvas' }, canvas)].filter(
              Boolean,
            ),
          ),
          aside,
        ],
      )
    }
  },
})

export function createSfDiagramEditorPlugin(): UiDiagramPlugin {
  return {
    diagramView: (props) => h(SfDiagramView, props as any),
  }
}

export const createSfDiagramPlugin = createSfDiagramEditorPlugin

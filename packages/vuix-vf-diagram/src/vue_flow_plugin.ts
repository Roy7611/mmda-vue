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
  UiDiagramType,
  UiDiagramViewProps,
} from '@mmda/vui'
import {
  diagramHookClass,
  emitDiagramUpdate,
  htmlAttributesOf,
  resolveDiagramPalette,
} from '@mmda/vui'
import {
  vuiConnectorToVueFlow,
  vuiNodeToVueFlow,
} from './vue_flow_map'

const FlowCanvas = defineAsyncComponent(async () => {
  try {
    const mod = await import('@vue-flow/core')
    return { default: mod.VueFlow as any }
  } catch {
    return {
      default: defineComponent({
        props: {
          nodes: { type: Array, default: () => [] },
          edges: { type: Array, default: () => [] },
        },
        setup(props) {
          return () =>
            h(
              'div',
              { class: 'mmda-diagram-canvas mmda-diagram-canvas--plain' },
              (props.nodes as any[]).map((node) =>
                h(
                  'article',
                  {
                    key: node.id,
                    class: 'mmda-diagram-node',
                    'data-id': node.id,
                    'data-type': node.type,
                  },
                  String(node.data?.label ?? node.id),
                ),
              ),
            )
        },
      }),
    }
  }
})

export const VueFlowDiagramView = defineComponent({
  name: 'VueFlowDiagramView',
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
    class: { type: [String, Array, Object], default: undefined },
    onSelect: Function as PropType<UiDiagramViewProps['onSelect']>,
    onUpdate: Function as PropType<UiDiagramViewProps['onUpdate']>,
    'onUpdate:nodes': Function as PropType<UiDiagramViewProps['onUpdate:nodes']>,
    'onUpdate:connectors': Function as PropType<
      UiDiagramViewProps['onUpdate:connectors']
    >,
    renderAside: Function as PropType<UiDiagramViewProps['renderAside']>,
  },
  setup(props) {
    return () => {
      const groups = resolveDiagramPalette(props as UiDiagramViewProps)
      const vfNodes = (props.nodes ?? []).map(vuiNodeToVueFlow)
      const vfEdges = (props.connectors ?? []).map(vuiConnectorToVueFlow)
      const palette = props.readonly
        ? null
        : h(
            'nav',
            { class: 'mmda-diagram-palette' },
            groups.map((group) =>
              h('details', { key: group.id, open: true }, [
                h('summary', group.title),
                group.items.map((item) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'mmda-diagram-symbol',
                      'data-shape-family': item.shape.family,
                      'data-shape-kind': item.shape.kind,
                      draggable: true,
                    },
                    item.label,
                  ),
                ),
              ]),
            ),
          )
      const canvas = h(FlowCanvas, {
        class: 'mmda-diagram-canvas',
        nodes: vfNodes,
        edges: vfEdges,
        nodesDraggable: !props.readonly,
        nodesConnectable: !props.readonly,
        elementsSelectable: true,
        style: {
          width: typeof props.width === 'number' ? `${props.width}px` : props.width,
          height:
            typeof props.height === 'number' ? `${props.height}px` : props.height,
        },
        'data-node-count': vfNodes.length,
        'data-edge-count': vfEdges.length,
        onNodeClick: (_: unknown, node: { id: string }) =>
          props.onSelect?.({ id: node.id, kind: 'node' }),
        onEdgeClick: (_: unknown, edge: { id: string }) =>
          props.onSelect?.({ id: edge.id, kind: 'connector' }),
      })
      return h(
        'div',
        {
          class: diagramHookClass(props.class, props.readonly),
          ...htmlAttributesOf(props as any),
          'data-diagram-type': props.diagramType,
          'data-engine': 'vue-flow',
        },
        [
          h(
            'div',
            { class: 'mmda-diagram-body' },
            [palette, canvas].filter(Boolean),
          ),
          h(
            'aside',
            { class: 'mmda-diagram-aside' },
            props.renderAside?.(null, null) ?? undefined,
          ),
        ],
      )
    }
  },
})

export function createVueDiagramPlugin(): UiDiagramPlugin {
  return {
    diagramView: (props) => h(VueFlowDiagramView, props as any),
  }
}

export function emitVueFlowChange(
  props: UiDiagramViewProps,
  nodes: UiDiagramNode[],
  connectors: UiDiagramConnector[],
): void {
  emitDiagramUpdate(props, nodes, connectors)
}

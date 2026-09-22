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
  UiDiagramType,
  UiDiagramProps,
} from '@mmda/vui'
import {
  diagramHookClass,
  diagramReadonlyOf,
  emitDiagramUpdate,
  resolveDiagramPalette,
  UiPluginName,
  type UiPlugin
} from '@mmda/vui'
import {
  vuiConnectorToVueFlow,
  vuiNodeToVueFlow,
} from './vue_flow_map'
import { uiRenderProps } from '@mmda/core'

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
    onSelect: Function as PropType<UiDiagramProps['onSelect']>,
    onNodesChange: Function as PropType<UiDiagramProps['onNodesChange']>,
    onConnectorsChange: Function as PropType<
      UiDiagramProps['onConnectorsChange']
    >,
    // Vue 的 v-model:nodes / v-model:connectors 糖（运行时入参，不进 core 契约）
    'onUpdate:nodes': Function as PropType<
      NonNullable<UiDiagramProps['onNodesChange']>
    >,
    'onUpdate:connectors': Function as PropType<
      NonNullable<UiDiagramProps['onConnectorsChange']>
    >,
    renderAside: Function as PropType<UiDiagramProps['renderAside']>,
  },
  setup(props) {
    return () => {
      const groups = resolveDiagramPalette(props as UiDiagramProps)
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
          ...uiRenderProps(props as any).attributes,
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

export function createVueDiagramPlugin(): UiPlugin {
  return {
    name: UiPluginName.diagram,
    buildUi(context, props) {
      const next = {
        ...(props as UiDiagramProps),
        readonly: diagramReadonlyOf(
          props as UiDiagramProps,
          String((context as any)?.view ?? ''),
        ),
      }
      return h(VueFlowDiagramView, next as any)
    },
  }
}

export function emitVueFlowChange(
  props: UiDiagramProps,
  nodes: UiDiagramNode[],
  connectors: UiDiagramConnector[],
): void {
  emitDiagramUpdate(props, nodes, connectors)
}

import { defineComponent, defineAsyncComponent, h, type PropType } from 'vue'

const DiagramImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-diagrams')
    return { default: mod.DiagramComponent as any }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h('p', { class: 'mmda-sf-bpmn-missing' }, 'BPMN requires @syncfusion/ej2-vue-diagrams'),
      }),
    }
  }
})

export const BpmnDiagram = defineComponent({
  name: 'BpmnDiagram',
  props: {
    nodes: { type: Array as PropType<any[]>, default: () => [] },
    connectors: { type: Array as PropType<any[]>, default: () => [] },
    height: { type: [String, Number], default: '400px' },
    readonly: { type: Boolean, default: true },
  },
  setup(props) {
    return () =>
      h(DiagramImpl, {
        nodes: props.nodes,
        connectors: props.connectors,
        height: props.height,
        snapSettings: props.readonly ? { constraints: 0 } : undefined,
      })
  },
})

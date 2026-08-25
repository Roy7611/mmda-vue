import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'

export const BpmnModeler = defineComponent({
  name: 'MmdaBpmnModeler',
  props: {
    xml: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    height: { type: [String, Number], default: '36rem' },
    moddleExtensions: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },
  emits: ['update:xml', 'ready', 'error'],
  setup(props, { emit }) {
    const host = ref<HTMLElement>()
    let modeler: any

    const importXml = async (xml: string) => {
      if (!modeler || !xml) return
      try {
        await modeler.importXML(xml)
        modeler.get('canvas').zoom('fit-viewport')
      } catch (error) {
        emit('error', error)
      }
    }

    onMounted(async () => {
      try {
        const { default: Modeler } = await import('bpmn-js/lib/Modeler')
        modeler = new Modeler({
          container: host.value,
          moddleExtensions: props.moddleExtensions as any,
          keyboard: props.readonly ? undefined : { bindTo: document },
        })
        modeler.on('commandStack.changed', async () => {
          if (props.readonly) return
          const result = await modeler.saveXML({ format: true })
          emit('update:xml', result.xml)
        })
        await importXml(props.xml)
        emit('ready', modeler)
      } catch (error) {
        emit('error', error)
      }
    })

    watch(() => props.xml, value => void importXml(value))
    onBeforeUnmount(() => modeler?.destroy())

    return () =>
      h('div', {
        ref: host,
        class: ['mmda-bpmn-modeler', props.readonly && 'is-readonly'],
        style: {
          height:
            typeof props.height === 'number' ? `${props.height}px` : props.height,
        },
      })
  },
})

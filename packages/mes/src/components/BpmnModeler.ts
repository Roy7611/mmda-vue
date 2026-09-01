import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'

type BpmnMethods = Record<string, (...args: any[]) => any>

export const BpmnModeler = defineComponent({
  name: 'MesBpmnModeler',
  props: {
    xml: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    height: { type: [String, Number], default: '36rem' },
    context: { type: Object, default: undefined },
    selectionCtx: { type: Object, default: undefined },
    bpmnProps: { type: Object as PropType<{ methods?: BpmnMethods }>, default: () => ({}) },
    bpmnPanelProps: { type: Object as PropType<{ footerSlot?: Function }>, default: () => ({}) },
    moddleExtensions: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
  },
  emits: ['update:xml', 'ready', 'error', 'update:selectionCtx', 'closePanel'],
  setup(props, { emit }) {
    const host = ref<HTMLElement>()
    let modeler: any

    const methods = () => props.bpmnProps?.methods ?? {}

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
        const [{ default: Modeler }, camunda] = await Promise.all([
          import('bpmn-js/lib/Modeler'),
          import('camunda-bpmn-moddle/resources/camunda.json').catch(() => ({ default: {} })),
        ])
        modeler = new Modeler({
          container: host.value,
          keyboard: props.readonly ? undefined : { bindTo: document },
          moddleExtensions: {
            camunda: (camunda as any).default ?? camunda,
            ...(props.moddleExtensions as any),
          },
        })
        const eventBus = modeler.get('eventBus')
        eventBus.on('commandStack.shape.create.postExecuted', (event: any) =>
          methods().createdShape?.(modeler, event),
        )
        eventBus.on('commandStack.shape.delete.preExecute', (event: any) => {
          const ok = methods().beforeRemoveShape?.(modeler, event.context.shape)
          if (ok === false) event.cancel?.() ?? (event.context.canExecute = false)
        })
        eventBus.on('commandStack.shape.delete.postExecuted', (event: any) =>
          methods().removedShape?.(modeler, event),
        )
        eventBus.on('commandStack.connection.create.preExecute', (event: any) => {
          const { source, target } = event.context
          return methods().beforeConnect?.(modeler, source, target)
        })
        eventBus.on('commandStack.connection.delete.postExecuted', (event: any) =>
          methods().removedConnection?.(modeler, event),
        )
        eventBus.on('commandStack.changed', async () => {
          await methods().elementsChanged?.(modeler, {})
          if (props.readonly) return
          const result = await modeler.saveXML({ format: true })
          emit('update:xml', result.xml)
        })
        eventBus.on('element.changed', (event: any) => methods().elementChanged?.(modeler, event))
        eventBus.on('element.dblclick', (event: any) => methods().elementDblcick?.(modeler, event))
        eventBus.on('commandStack.label.create.postExecuted', (event: any) =>
          methods().updateLabel?.(modeler, event),
        )
        eventBus.on('contextPad.create', (event: any) => {
          methods().initContextPadEntries?.(event.element, event.entries)
        })
        await importXml(props.xml || props.context?.model?.xmlJson)
        emit('ready', modeler)
      } catch (error) {
        emit('error', error)
      }
    })

    watch(
      () => props.xml || props.context?.model?.xmlJson,
      value => void importXml(value),
    )
    onBeforeUnmount(() => modeler?.destroy())

    return () =>
      h('div', { class: 'mmda-bpmn-modeler-shell', style: { display: 'flex', minHeight: props.height } }, [
        h('div', {
          ref: host,
          class: ['mmda-bpmn-modeler', props.readonly && 'is-readonly'],
          style: {
            flex: 1,
            height:
              typeof props.height === 'number' ? `${props.height}px` : props.height,
          },
        }),
        props.selectionCtx && props.bpmnPanelProps?.footerSlot
          ? h(
              'aside',
              { class: 'mmda-bpmn-panel' },
              props.bpmnPanelProps.footerSlot(props.selectionCtx, modeler),
            )
          : null,
      ])
  },
})

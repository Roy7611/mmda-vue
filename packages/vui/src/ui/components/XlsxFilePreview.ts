import { defineAsyncComponent, defineComponent, h, type PropType } from 'vue'

const ExcelPreview = defineAsyncComponent(async () => {
  try {
    return (await import('@vue-office/excel')) as any
  } catch {
    return {
      default: defineComponent({
        props: { src: { type: [String, ArrayBuffer] } },
        setup: () => () =>
          h('p', { class: 'mmda-file-preview-missing' }, 'XLSX preview requires @vue-office/excel'),
      }),
    } as any
  }
})

export const XlsxFilePreview = defineComponent({
  name: 'XlsxFilePreview',
  props: {
    source: {
      type: [String, ArrayBuffer] as PropType<string | ArrayBuffer>,
      required: true,
    },
    title: String,
    height: { type: [String, Number], default: '70vh' },
  },
  emits: ['rendered', 'error'],
  setup(props, { emit }) {
    return () =>
      h(ExcelPreview, {
        src: props.source,
        style: {
          width: '100%',
          height:
            typeof props.height === 'number' ? `${props.height}px` : props.height,
        },
        onRendered: () => emit('rendered'),
        onError: (error: unknown) => emit('error', error),
      })
  },
})

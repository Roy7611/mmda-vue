import {
  defineAsyncComponent,
  defineComponent,
  h,
  type PropType,
  type VNode,
} from 'vue'
import { UiPluginName, type UiPlugin } from '@mmda/vui'

const missingPreview = (label: string) =>
  defineComponent({
    props: {
      source: { type: [String, ArrayBuffer] },
      title: String,
      height: { type: [String, Number], default: '70vh' },
    },
    setup() {
      return () =>
        h('p', { class: 'mmda-file-preview-missing' }, label)
    },
  })

const ExcelPreview = defineAsyncComponent(async () => {
  try {
    return (await import('@vue-office/excel')) as any
  } catch {
    return {
      default: missingPreview('XLSX preview requires @vue-office/excel'),
    } as any
  }
})

const DocxPreview = defineAsyncComponent(async () => {
  try {
    return (await import('@vue-office/docx')) as any
  } catch {
    return {
      default: missingPreview('DOCX preview requires @vue-office/docx'),
    } as any
  }
})

export interface OfficePreviewProps {
  source: string | ArrayBuffer
  extension?: string
  title?: string
  height?: string | number
}

function officeStyle(height?: string | number) {
  return {
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : (height ?? '70vh'),
  }
}

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
        style: officeStyle(props.height),
        onRendered: () => emit('rendered'),
        onError: (error: unknown) => emit('error', error),
      })
  },
})

export const DocxFilePreview = defineComponent({
  name: 'DocxFilePreview',
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
      h(DocxPreview, {
        src: props.source,
        style: officeStyle(props.height),
        onRendered: () => emit('rendered'),
        onError: (error: unknown) => emit('error', error),
      })
  },
})

export function createOfficePlugin(): UiPlugin<VNode> {
  return {
    name: UiPluginName.office,
    buildUi(_context, props) {
      const next = (props ?? {}) as unknown as OfficePreviewProps
      const extension = String(next.extension ?? '').toLowerCase()
      if (extension === 'xlsx' || extension === 'xls') {
        return h(XlsxFilePreview, next as any)
      }
      return h(DocxFilePreview, next as any)
    },
  }
}

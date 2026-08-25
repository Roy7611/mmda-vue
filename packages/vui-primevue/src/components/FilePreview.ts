import { defineAsyncComponent, defineComponent, h, type PropType } from 'vue'
import Message from 'primevue/message'

const DocxPreview = defineAsyncComponent(() => import('@vue-office/docx'))
const ExcelPreview = defineAsyncComponent(() => import('@vue-office/excel'))

const extensionOf = (source: string, explicit?: string) => {
  if (explicit) return explicit.toLowerCase().replace(/^\./, '')
  const pathname = source.split(/[?#]/)[0]
  return pathname.split('.').pop()?.toLowerCase() ?? ''
}

export const FilePreview = defineComponent({
  name: 'MmdaFilePreview',
  props: {
    source: { type: [String, ArrayBuffer] as PropType<string | ArrayBuffer>, required: true },
    extension: String,
    title: String,
    height: { type: [String, Number], default: '70vh' },
  },
  emits: ['rendered', 'error'],
  setup(props, { emit }) {
    return () => {
      const source = props.source
      const extension =
        typeof source === 'string' ? extensionOf(source, props.extension) : props.extension
      const style = {
        width: '100%',
        height:
          typeof props.height === 'number' ? `${props.height}px` : props.height,
      }
      if (extension === 'docx') {
        return h(DocxPreview, {
          src: source,
          style,
          onRendered: () => emit('rendered'),
          onError: (error: unknown) => emit('error', error),
        })
      }
      if (extension === 'xlsx' || extension === 'xls') {
        return h(ExcelPreview, {
          src: source,
          style,
          onRendered: () => emit('rendered'),
          onError: (error: unknown) => emit('error', error),
        })
      }
      if (
        typeof source === 'string' &&
        ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(extension ?? '')
      ) {
        return h('img', {
          src: source,
          alt: props.title ?? '',
          style: { ...style, objectFit: 'contain' },
        })
      }
      if (typeof source === 'string' && extension === 'pdf') {
        return h('iframe', {
          src: source,
          title: props.title ?? 'PDF preview',
          style,
        })
      }
      return h(
        Message,
        { severity: 'info' },
        () => `Preview is not available for .${extension || 'unknown'} files.`,
      )
    }
  },
})

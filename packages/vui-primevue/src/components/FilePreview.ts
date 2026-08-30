import { DocxFilePreview, XlsxFilePreview } from '@mmda/vui'
import { defineComponent, h, type PropType } from 'vue'

export { DocxFilePreview, XlsxFilePreview }

const extensionOf = (source: string, explicit?: string) => {
  if (explicit) return explicit.toLowerCase().replace(/^\./, '')
  const pathname = source.split(/[?#]/)[0]
  return pathname.split('.').pop()?.toLowerCase() ?? ''
}

/** @deprecated 请用 `builder.buildFilePreview` 或 vui 的 Docx/Xlsx 组件。 */
export const FilePreview = defineComponent({
  name: 'MmdaFilePreview',
  props: {
    source: {
      type: [String, ArrayBuffer] as PropType<string | ArrayBuffer>,
      required: true,
    },
    extension: String,
    title: String,
    height: { type: [String, Number], default: '70vh' },
  },
  setup(props) {
    return () => {
      const source = props.source
      const extension =
        typeof source === 'string'
          ? extensionOf(source, props.extension)
          : (props.extension ?? '')
      const style = {
        width: '100%',
        height:
          typeof props.height === 'number' ? `${props.height}px` : props.height,
      }
      if (extension === 'docx') return h(DocxFilePreview, { source, ...props })
      if (extension === 'xlsx' || extension === 'xls')
        return h(XlsxFilePreview, { source, ...props })
      if (
        typeof source === 'string' &&
        ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(extension)
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
        'p',
        { class: 'mmda-file-preview-missing' },
        `Preview is not available for .${extension || 'unknown'} files.`,
      )
    }
  },
})

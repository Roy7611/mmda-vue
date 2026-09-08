import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import type {
  UiMarkdownEditorPlugin,
  UiMarkdownEditorProps,
} from '@mmda/vui'
import { htmlAttributesOf, markdownEditorHookClass } from '@mmda/vui'

function cssSize(value: string | number | undefined, fallback: string) {
  if (value == null) return fallback
  return typeof value === 'number' ? `${value}px` : value
}

export const VditorMarkdownEditor = defineComponent({
  name: 'VditorMarkdownEditor',
  props: {
    value: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '70vh' },
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onChange: Function as PropType<UiMarkdownEditorProps['onChange']>,
  },
  setup(props) {
    const host = ref<HTMLElement | null>(null)
    let vditor: {
      getValue: () => string
      setValue: (markdown: string) => void
      destroy: () => void
      disabled: () => void
      enable: () => void
    } | null = null
    let applying = false

    onMounted(async () => {
      if (!host.value) return
      const mod = await import('vditor')
      await import('vditor/dist/index.css')
      const Vditor = (mod as any).default ?? mod
      vditor = new Vditor(host.value, {
        mode: 'ir',
        value: props.value,
        cache: { enable: false },
        height: '100%',
        lang: 'zh_CN',
        after: () => {
          if (!vditor) return
          if (props.readonly) vditor.disabled()
          else vditor.enable()
        },
        input: (text: string) => {
          if (applying) return
          props.onChange?.(text)
        },
        blur: (text: string) => {
          if (applying) return
          props.onChange?.(text)
        },
      })
    })

    watch(
      () => props.value,
      (value) => {
        if (!vditor) return
        if (vditor.getValue() === value) return
        applying = true
        vditor.setValue(value ?? '')
        applying = false
      },
    )

    watch(
      () => props.readonly,
      (readonly) => {
        if (!vditor) return
        if (readonly) vditor.disabled()
        else vditor.enable()
      },
    )

    onBeforeUnmount(() => {
      vditor?.destroy()
      vditor = null
    })

    return () =>
      h('div', {
        class: markdownEditorHookClass(props.class, props.readonly),
        style: {
          width: cssSize(props.width, '100%'),
          height: cssSize(props.height, '70vh'),
        },
        ...htmlAttributesOf(props as any),
      }, [
        h('div', {
          ref: host,
          class: 'mmda-markdown-editor-host',
        }),
      ])
  },
})

export function createMarkdownEditorPlugin(): UiMarkdownEditorPlugin {
  return {
    markdownEditor: (props) => h(VditorMarkdownEditor, props as any),
  }
}

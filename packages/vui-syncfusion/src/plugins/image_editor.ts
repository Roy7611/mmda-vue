import {
  defineAsyncComponent,
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import type { UiImageEditorPlugin, UiImageEditorProps, UiImageEditorTool } from '@mmda/vui'
import { htmlAttributesOf, imageEditorHookClass, resolveImageEditorTools } from '@mmda/vui'

function cssSize(value: string | number | undefined, fallback: string) {
  if (value == null) return fallback
  return typeof value === 'number' ? `${value}px` : value
}

function ej2ToolbarOf(
  tools: UiImageEditorTool[],
  readonly: boolean,
): string[] {
  if (readonly) return []
  const items: string[] = []
  if (tools.includes('crop')) items.push('Crop')
  if (tools.includes('rotate') || tools.includes('flip')) {
    items.push('Transform')
  }
  items.push('Undo', 'Redo', 'Reset')
  return items
}

function imageDataToSave(imageData: ImageData): Promise<{
  blob: Blob
  dataUrl: string
}> {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('canvas'))
  ctx.putImageData(imageData, 0, 0)
  const dataUrl = canvas.toDataURL('image/png')
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('blob'))
        return
      }
      resolve({ blob, dataUrl })
    }, 'image/png')
  })
}

const ImageEditorImpl = defineAsyncComponent(async () => {
  try {
    const mod = await import('@syncfusion/ej2-vue-image-editor')
    await import('@syncfusion/ej2-image-editor/styles/material3.css')
    return { default: (mod as any).ImageEditorComponent }
  } catch {
    return {
      default: defineComponent({
        setup: () => () =>
          h(
            'p',
            { class: 'mmda-sf-image-editor-missing' },
            'Image editor requires @syncfusion/ej2-vue-image-editor',
          ),
      }),
    }
  }
})

export const SfImageEditorView = defineComponent({
  name: 'SfImageEditorView',
  props: {
    src: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '70vh' },
    tools: Array as PropType<UiImageEditorTool[]>,
    class: { type: [String, Array, Object], default: undefined },
    htmlAttributes: { type: Object, default: undefined },
    onSave: Function as PropType<UiImageEditorProps['onSave']>,
  },
  setup(props) {
    const host = ref<{ ej2Instances?: any } | null>(null)

    function editor() {
      return host.value?.ej2Instances
    }

    function openSrc(src: string) {
      const inst = editor()
      if (!inst || !src) return
      inst.open(src)
    }

    onMounted(() => {
      if (props.src) openSrc(props.src)
    })

    watch(
      () => props.src,
      (src) => {
        if (src) openSrc(src)
      },
    )

    async function save() {
      const inst = editor()
      if (!inst || !props.onSave) return
      const imageData = inst.getImageData?.() as ImageData | undefined
      if (!imageData) return
      props.onSave(await imageDataToSave(imageData))
    }

    return () => {
      const tools = resolveImageEditorTools(props)
      const style = {
        width: cssSize(props.width, '100%'),
        height: cssSize(props.height, '70vh'),
      }
      return h(
        'div',
        {
          class: imageEditorHookClass(props.class, props.readonly),
          style,
          ...htmlAttributesOf(props as any),
        },
        [
          h(ImageEditorImpl, {
            ref: host,
            toolbar: ej2ToolbarOf(tools, props.readonly),
            disabled: props.readonly,
            height: '100%',
            width: '100%',
            created: () => {
              if (props.src) openSrc(props.src)
            },
          }),
          props.readonly || !props.onSave
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  class: 'mmda-image-editor-save',
                  onClick: () => {
                    void save()
                  },
                },
                '保存',
              ),
        ],
      )
    }
  },
})

export function createSfImageEditorPlugin(): UiImageEditorPlugin {
  return {
    installed: true,
    imageEditor: (props) => h(SfImageEditorView, props as any),
  }
}

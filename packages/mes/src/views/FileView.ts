import { defineComponent, h, inject } from 'vue'
import { useRoute } from 'vue-router'
import { UI_BUILDER_KEY, type UiBuilder } from '@mmda/vui'

export const FileView = defineComponent({
  name: 'FileView',
  setup() {
    const route = useRoute()
    const builder = inject(UI_BUILDER_KEY) as UiBuilder | undefined
    return () => {
      const fileUrl =
        (route.query.fileUrl as string) ||
        (typeof window !== 'undefined'
          ? String(window.history.state?.fileUrl ?? '')
          : '')
      if (!fileUrl) {
        return h('div', { style: { padding: '32px' } }, '无文件地址')
      }
      return h(
        'div',
        { style: { height: '100vh', display: 'flex', flexDirection: 'column' } },
        [
          h('div', { style: { flex: 1, overflow: 'hidden' } }, [
            builder
              ? builder.buildFilePreview(fileUrl, { height: '100%' })
              : h('iframe', { src: fileUrl, style: { width: '100%', height: '100%' } }),
          ]),
        ],
      )
    }
  },
})

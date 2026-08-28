import { FilePreview } from '@mmda/vui-primevue'
import { defineComponent, h } from 'vue'
import { useRoute } from 'vue-router'

export const FileView = defineComponent({
  name: 'FileView',
  setup() {
    const route = useRoute()
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
            h(FilePreview, { source: fileUrl, height: '100%' }),
          ]),
        ],
      )
    }
  },
})

import { defineComponent, h, inject } from 'vue'
import { useRoute } from 'vue-router'
import { UI_BUILDER_KEY, type UiBuilder } from '@mmda/vui'

export const NoAuthorityView = defineComponent({
  name: 'NoAuthorityView',
  setup: () => () =>
    h('div', { style: { padding: '32px' } }, [
      h('h1', '无权限'),
      h('p', '当前账号不能访问该模块。请联系管理员或返回首页。'),
    ]),
})

export const OfficeOnlineView = defineComponent({
  name: 'OfficeOnlineView',
  setup: () => () =>
    h('div', { style: { padding: '32px' } }, [
      h('h1', 'Office Online'),
      h('p', '请使用统一文件预览或附件下载。'),
    ]),
})

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
              : h('iframe', {
                  src: fileUrl,
                  style: { width: '100%', height: '100%' },
                }),
          ]),
        ],
      )
    }
  },
})

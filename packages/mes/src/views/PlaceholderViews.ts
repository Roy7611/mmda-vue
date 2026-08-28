import { defineComponent, h } from 'vue'

export const NoAuthorityView = defineComponent({
  name: 'NoAuthorityView',
  setup() {
    return () =>
      h('div', { style: { padding: '32px' } }, [
        h('h1', '无权限'),
        h('p', '当前账号不能访问该模块。请联系管理员或返回首页。'),
      ])
  },
})

export const Custompages = defineComponent({
  name: 'Custompages',
  setup() {
    return () =>
      h('div', { style: { padding: '32px' } }, [
        h('h1', '自制页面'),
        h(
          'p',
          '看板、OEE、追溯等非标准 CRUD 页仍按旧仓占位。甘特/工位门户源码已迁入 components，尚未接到新会话。',
        ),
      ])
  },
})

export const OfficeOnlineView = defineComponent({
  name: 'OfficeOnlineView',
  setup() {
    return () =>
      h('div', { style: { padding: '32px' } }, [
        h('h1', 'Office Online'),
        h('p', '不嵌入旧版 Office Online。请使用附件下载或 FileView。'),
      ])
  },
})

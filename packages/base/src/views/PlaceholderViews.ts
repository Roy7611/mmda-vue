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
        h('p', 'DailyRecords / MaterialCat / PartnerCat 仍为占位说明页，未接入通用 CRUD。'),
      ])
  },
})

export const OfficeOnlineView = defineComponent({
  name: 'OfficeOnlineView',
  setup() {
    return () =>
      h('div', { style: { padding: '32px' } }, [
        h('h1', 'Office Online'),
        h('p', '本验证应用不嵌入旧版 Office Online / authority 深路径。请使用附件下载。'),
      ])
  },
})

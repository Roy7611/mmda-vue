import { defineComponent, h } from 'vue'

export const ToolCategoryEditor = defineComponent({
  name: 'ToolCategoryEditor',
  setup() {
    return () =>
      h('p', { style: { padding: '16px' } }, '工具类别请走 /MES/ToolCategories')
  },
})

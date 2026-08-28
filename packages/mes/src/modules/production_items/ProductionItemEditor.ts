import { defineComponent, h } from 'vue'

export const ProductionItemEditor = defineComponent({
  name: 'ProductionItemEditor',
  setup() {
    return () =>
      h('p', { style: { padding: '16px' } }, '在制品请走 /MES/ProductionItems')
  },
})

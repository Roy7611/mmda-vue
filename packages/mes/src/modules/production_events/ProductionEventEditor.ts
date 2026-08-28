import { defineComponent, h } from 'vue'

export const ProductionEventEditor = defineComponent({
  name: 'ProductionEventEditor',
  setup() {
    return () =>
      h('p', { style: { padding: '16px' } }, '生产事件请走 /MES/ProductionEvents')
  },
})

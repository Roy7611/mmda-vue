import { defineComponent, h, Suspense } from 'vue'
import { useI18n } from 'vue-i18n'

export const ProductionEventEditor = defineComponent({
  name: 'ProductionEventEditor',
  setup() {
    const { t } = useI18n()
    return () =>
      h('p', { style: { padding: '16px' } }, t('view.productionEventEditorHint'))
  },
})

export function productionEventEditorNode(props?: Record<string, any>) {
  return h(Suspense, {}, {
    default: () => h(ProductionEventEditor, props as any),
  })
}

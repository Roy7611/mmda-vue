import { defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'

export const ToolCategoryEditor = defineComponent({
  name: 'ToolCategoryEditor',
  setup() {
    const { t } = useI18n()
    return () =>
      h('p', { style: { padding: '16px' } }, t('view.toolCategoryEditorHint'))
  },
})

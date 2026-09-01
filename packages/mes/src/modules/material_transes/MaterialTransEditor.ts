import { defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'

/** 旧仓逐文件 Editor 未迁入。弹层仍 import 该符号时给出占位。 */
export const MaterialTransEditor = defineComponent({
  name: 'MaterialTransEditor',
  setup() {
    const { t } = useI18n()
    return () =>
      h('p', { style: { padding: '16px' } }, t('view.materialTransEditorHint'))
  },
})

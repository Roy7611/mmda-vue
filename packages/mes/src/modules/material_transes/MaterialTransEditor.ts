import { defineComponent, h } from 'vue'

/** 旧仓逐文件 Editor 未迁入。弹层仍 import 该符号时给出占位。 */
export const MaterialTransEditor = defineComponent({
  name: 'MaterialTransEditor',
  setup() {
    return () =>
      h('p', { style: { padding: '16px' } }, '移料编辑请走 /MES/MaterialTranses')
  },
})

import { defineComponent, h } from 'vue'

export const ProjectWorkPackageEditor = defineComponent({
  name: 'ProjectWorkPackageEditor',
  setup() {
    return () =>
      h('p', { style: { padding: '16px' } }, '工作包请走 /MES/ProjectWorkPackages')
  },
})

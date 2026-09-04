import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import { TreeGrid, Edit, Filter, Resize, Selection, Sort } from '@syncfusion/ej2-treegrid'
import '@syncfusion/ej2-treegrid/styles/material3.css'

TreeGrid.Inject(Edit, Filter, Resize, Selection, Sort)

export const SfTreeGrid = defineComponent({
  name: 'SfTreeGrid',
  props: {
    options: { type: Object as PropType<Record<string, unknown>>, required: true },
  },
  setup(props, { expose }) {
    const host = ref<HTMLElement | null>(null)
    let grid: TreeGrid | null = null

    onMounted(() => {
      if (!host.value) return
      const options = { ...(props.options ?? {}) } as any
      grid = new TreeGrid(options)
      grid.appendTo(host.value)
      if (options.enableCollapseAll) {
        requestAnimationFrame(() => grid?.collapseAll?.())
      }
    })

    watch(
      () => props.options?.dataSource,
      (data) => {
        if (!grid || data === undefined) return
        grid.dataSource = data as any
        grid.dataBind?.()
      },
    )

    onBeforeUnmount(() => {
      grid?.destroy?.()
      grid = null
    })

    expose({
      get ej2Instances() {
        return grid
      },
    })

    return () =>
      h('div', {
        ref: host,
        class: 'mmda-sf-treegrid',
        style: { width: '100%', minHeight: '240px' },
      })
  },
})

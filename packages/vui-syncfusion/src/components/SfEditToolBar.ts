import { defineComponent, type PropType } from 'vue'
import { paintEditToolbar } from '@mmda/vui'
import type { ModuleToolbarProps, UiSlots, VueUiBuilder } from '@mmda/vui'
import type { UiContext } from '@mmda/core'

export const SfEditToolBar = defineComponent({
  name: 'SfEditToolBar',
  props: {
    builder: { type: Object as PropType<VueUiBuilder>, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    toolbarProps: { type: Object as PropType<ModuleToolbarProps>, default: () => ({}) },
    slots: { type: Object as PropType<UiSlots>, default: undefined },
  },
  setup(props) {
    return () =>
      paintEditToolbar(
        props.builder,
        props.context as never,
        props.toolbarProps,
        props.slots,
      )
  },
})

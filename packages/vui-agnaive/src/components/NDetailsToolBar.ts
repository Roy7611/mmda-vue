import { defineComponent, type PropType } from 'vue'
import { paintDetailsToolbar } from '@mmda/vui'
import type { ModuleToolbarProps, UiAction, UiSlots, VueUiBuilder } from '@mmda/vui'
import type { UiContext } from '@mmda/core'

export const NDetailsToolBar = defineComponent({
  name: 'NDetailsToolBar',
  props: {
    builder: { type: Object as PropType<VueUiBuilder>, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    toolbarProps: { type: Object as PropType<ModuleToolbarProps>, default: () => ({}) },
    slots: { type: Object as PropType<UiSlots>, default: undefined },
    extraMore: { type: Array as PropType<UiAction[]>, default: () => [] },
  },
  setup(props) {
    return () =>
      paintDetailsToolbar(
        props.builder,
        props.context as never,
        props.toolbarProps,
        props.slots,
        props.extraMore,
      )
  },
})

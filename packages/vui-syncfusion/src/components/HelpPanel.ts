import { defineComponent, h, type PropType, type VNodeChild } from 'vue'
import { SidebarComponent, TabComponent } from '@syncfusion/ej2-vue-navigations'

export interface HelpPanelItem {
  key: string
  label: string
  content: () => VNodeChild
}

export const HelpPanel = defineComponent({
  name: 'MmdaHelpPanel',
  props: {
    visible: Boolean,
    title: { type: String, default: 'Help' },
    items: {
      type: Array as PropType<HelpPanelItem[]>,
      default: () => [],
    },
    active: String,
  },
  emits: ['update:visible', 'update:active'],
  setup(props, { emit }) {
    return () =>
      h(
        SidebarComponent as any,
        {
          isOpen: props.visible,
          position: 'Right',
          header: props.title,
          class: 'mmda-help-panel',
          close: () => emit('update:visible', false),
        },
        {
          default: () =>
            h(TabComponent as any, {
              items: props.items.map(item => ({
                header: { text: item.label },
                content: item.content,
              })),
              selectedItem: props.active ?? props.items[0]?.key,
              selecting: (args: any) =>
                emit('update:active', String(args.item?.id ?? args.selectedIndex)),
            }),
        },
      )
  },
})

import { defineComponent, h, type PropType, type VNodeChild } from 'vue'
import Drawer from 'primevue/drawer'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

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
        Drawer,
        {
          visible: props.visible,
          header: props.title,
          position: 'right',
          class: 'mmda-help-panel',
          'onUpdate:visible': (value: boolean) => emit('update:visible', value),
        },
        {
          default: () =>
            h(
              Tabs,
              {
                value: props.active ?? props.items[0]?.key,
                'onUpdate:value': (value: string | number) =>
                  emit('update:active', String(value)),
              },
              {
                default: () => [
                  h(
                    TabList,
                    {},
                    () =>
                      props.items.map(item =>
                        h(Tab, { key: item.key, value: item.key }, () => item.label),
                      ),
                  ),
                  h(
                    TabPanels,
                    {},
                    () =>
                      props.items.map(item =>
                        h(
                          TabPanel,
                          { key: item.key, value: item.key },
                          item.content,
                        ),
                      ),
                  ),
                ],
              },
            ),
        },
      )
  },
})

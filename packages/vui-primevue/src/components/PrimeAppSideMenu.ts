import { computed, defineComponent, h, type PropType } from 'vue'
import type { Module, UiAppMenuItem } from '@mmda/core'
import { VueAppSideMenu, useCompactViewport } from '@mmda/vui'

type SlotFn = () => unknown

export const PrimeAppSideMenu = defineComponent({
  name: 'PrimeAppSideMenu',
  inheritAttrs: false,
  props: {
    modules: {
      type: Array as PropType<Module[]>,
      default: (): Module[] => [],
    },
    items: {
      type: Array as PropType<UiAppMenuItem[]>,
      default: undefined,
    },
    compact: { type: Boolean, default: undefined },
    logo: { type: Function as PropType<SlotFn>, default: undefined },
    footer: { type: Function as PropType<SlotFn>, default: undefined },
  },
  setup(props, { attrs }) {
    const mediaCompact = useCompactViewport()
    const compact = computed(() =>
      typeof props.compact === 'boolean' ? props.compact : mediaCompact.value,
    )
    return () => {
      if (compact.value) {
        return h(VueAppSideMenu, {
          modules: props.modules,
          items: props.items,
          compact: true,
          logo: props.logo,
          footer: props.footer,
          class: ['mmda-app-menu', attrs.class],
        })
      }
      return h('aside', { class: ['mmda-sidebar', attrs.class] }, [
        props.logo
          ? h('div', { class: 'mmda-sidebar__header' }, [props.logo() as any])
          : null,
        h('div', { class: 'mmda-sidebar__body' }, [
          h(VueAppSideMenu, {
            modules: props.modules,
            items: props.items,
            compact: false,
          }),
        ]),
        props.footer
          ? h('div', { class: 'mmda-sidebar__footer' }, [
              props.footer() as any,
            ])
          : null,
      ])
    }
  },
})

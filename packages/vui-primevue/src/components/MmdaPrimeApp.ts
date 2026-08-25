import { defineComponent, h, type PropType, type VNode } from 'vue'
import type { Module } from '@mmda/core'
import type { PrimeVueUiBuilder } from '../prime_builder'
import { PrimeVueOverlayHost } from './PrimeVueOverlayHost'

export const MmdaPrimeApp = defineComponent({
  name: 'MmdaPrimeApp',
  props: {
    builder: {
      type: Object as PropType<PrimeVueUiBuilder>,
      required: true,
    },
    modules: {
      type: Array as PropType<Module[]>,
      default: () => [],
    },
    layout: {
      type: String as PropType<'sidebarLeft' | 'topBarFull'>,
      default: 'sidebarLeft',
    },
    logo: {
      type: Function as PropType<() => VNode | string | null>,
      default: () => null,
    },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'mmda-prime-app' }, [
        props.builder.buildAppScaffold({
          layout: props.layout,
          topBar:
            props.layout === 'topBarFull'
              ? () =>
                  props.builder.buildAppTopBar({
                    modules: props.modules,
                    logo: props.logo as any,
                    actions: slots.actions as any,
                  })
              : undefined,
          sideBar: () =>
            props.builder.buildAppSideBar({
              modules: props.modules,
              header: slots.sidebarHeader ?? (props.logo as any),
              footer:
                props.layout === 'sidebarLeft'
                  ? (slots.sidebarFooter ?? slots.actions)
                  : slots.sidebarFooter,
            }),
          body: () => slots.default?.(),
          bottomBar: slots.bottomBar as any,
        }),
        h(PrimeVueOverlayHost),
      ])
  },
})

import { defineComponent, h, type VNode } from 'vue'
import { NConfigProvider } from 'naive-ui'
import {
  naiveLocaleOf,
  naiveOverridesRef,
  naiveSkinState,
  naiveThemeRef,
} from './agnaive_theme'

const AgNaiveConfig = defineComponent({
  name: 'AgNaiveConfig',
  setup(_, { slots }) {
    return () => {
      const loc = naiveLocaleOf(naiveSkinState.locale)
      return h(
        NConfigProvider,
        {
          theme: naiveThemeRef.value,
          themeOverrides: naiveOverridesRef.value,
          locale: loc.locale,
          dateLocale: loc.dateLocale,
          class: 'mmda-agnaive-config',
        },
        { default: () => slots.default?.() },
      )
    }
  },
})

export function wrapNaiveConfig(child: VNode): VNode {
  return h(AgNaiveConfig, null, { default: () => child })
}

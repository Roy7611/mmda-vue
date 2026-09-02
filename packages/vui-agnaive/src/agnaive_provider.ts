import { h, type VNode } from 'vue'
import { NConfigProvider } from 'naive-ui'
import {
  naiveLocaleOf,
  naiveOverridesRef,
  naiveSkinState,
  naiveThemeRef,
} from './agnaive_theme'

export function wrapNaiveConfig(child: VNode): VNode {
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
    { default: () => child },
  )
}

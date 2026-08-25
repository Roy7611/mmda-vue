import { defineComponent, h, inject } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { UI_APP_KEY, UI_BUILDER_KEY, type MmdaApplication } from '@mmda/vui'
import {
  MmdaPrimeApp,
  type PrimeVueUiBuilder,
} from '@mmda/vui-primevue'
import { AppLogo } from './components/AppLogo'
import { AppUserFooter } from './components/AppUserFooter'

export const AppShell = defineComponent({
  name: 'AppShell',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const builder = inject(UI_BUILDER_KEY)! as PrimeVueUiBuilder
    const route = useRoute()
    return () => {
      if (route.meta.allowAnonymous) return h(RouterView)
      return h(
        MmdaPrimeApp,
        {
          builder,
          modules: app.modules,
          layout: 'sidebarLeft',
        },
        {
          default: () => h(RouterView),
          sidebarHeader: () => h(AppLogo),
          sidebarFooter: () => h(AppUserFooter),
        },
      )
    }
  },
})

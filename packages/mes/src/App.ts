import { defineComponent, h, inject } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type UiBuilder,
} from '@mmda/vui'
import { AppLogo } from './components/AppLogo'
import { AppUserFooter } from './components/AppUserFooter'

export const AppShell = defineComponent({
  name: 'AppShell',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const route = useRoute()
    return () => {
      if (route.meta.allowAnonymous) return h(RouterView)
      return h('div', { class: 'mmda-app' }, [
        builder.buildAppScaffold({
          layout: 'sidebarLeft',
          sideBar: () =>
            builder.buildAppSideBar({
              modules: app.modules,
              header: () => h(AppLogo),
              footer: () => h(AppUserFooter),
            }),
          body: () => h(RouterView),
        }),
      ])
    }
  },
})

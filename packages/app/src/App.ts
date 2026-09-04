import { defineComponent, h, inject, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type UiBuilder,
} from '@mmda/vui'
import { AppLogo } from './components/AppLogo'
import { AppUserFooter } from './components/AppUserFooter'

/** The only application shell for every registered business plugin. */
export const AppShell = defineComponent({
  name: 'AppShell',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const route = useRoute()
    const router = useRouter()

    // JWT 失效后若仍停在受保护路由，路由守卫不会自动再跑；这里兜底回登录页
    watch(
      () => [app.canAccess, route.fullPath, route.meta.allowAnonymous] as const,
      ([canAccess, fullPath, allowAnonymous]) => {
        if (allowAnonymous || canAccess) return
        void router.replace({
          path: '/Signin',
          query: { redirect: fullPath },
        })
      },
      { immediate: true },
    )

    return () => {
      if (route.meta.allowAnonymous) return h(RouterView)
      if (!app.canAccess) {
        return h('div', { class: 'mmda-app mmda-app--signing-out' })
      }
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

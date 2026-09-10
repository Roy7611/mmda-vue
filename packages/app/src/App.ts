import { defineComponent, h, inject, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  AppLayout,
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type VueUiBuilder,
} from '@mmda/vui'
import { AppLogo } from './components/AppLogo'
import { AppUserFooter } from './components/AppUserFooter'

/**
 * 全应用唯一外壳。
 * 壳布局走 {@link AppLayout.scaffold}（core UiAppLayout），不再经 Builder.buildAppScaffold。
 * 导航槽仍由 Builder.buildAppSideBar 产出。
 */
export const AppShell = defineComponent({
  name: 'AppShell',
  setup() {
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const builder = inject(UI_BUILDER_KEY)! as VueUiBuilder
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
        new AppLayout('sidebarLeft').scaffold({
          variant: 'sidebarLeft',
          nav: builder.buildAppSideBar({
            modules: app.modules,
            header: () => h(AppLogo),
            footer: () => h(AppUserFooter),
          }),
          page: h(RouterView),
        }),
      ])
    }
  },
})

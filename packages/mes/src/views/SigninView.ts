import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type UiBuilder,
} from '@mmda/vui'
import { defineComponent, h, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MES_KEY } from '../keys'

export const SigninView = defineComponent({
  name: 'SigninView',
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const app = (inject(MES_KEY) ??
      inject(UI_APP_KEY))! as MmdaApplication
    const router = useRouter()
    const route = useRoute()

    const signinForm = builder.buildSigninForm(
      {
        context: app,
        onSubmit: async (user: SigninUser) => {
          try {
            await app.signin(user.username, user.password)
            const redirect = String(
              route.query.redirect ?? `/${app.name.toUpperCase()}/`,
            )
            await router.replace(redirect)
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error ?? '登录失败')
            await app.toast({} as any, {
              severity: 'error',
              detail: message,
              summary: '错误',
              life: 3000,
            })
          }
        },
      },
      // 页面已有「制造执行登录」标题，不再重复渲染表单内「登录」
      { title: () => null },
    )

    return () =>
      h(
        'div',
        {
          class: 'mmda-signin-page',
          style: {
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
          },
        },
        [
          h('div', { style: { width: 'min(420px, 100%)' } }, [
            h('h1', { style: { marginBottom: '16px' } }, '制造执行登录'),
            signinForm,
          ]),
        ],
      )
  },
})

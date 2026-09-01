import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type UiBuilder,
} from '@mmda/vui'
import { defineComponent, h, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export const SigninView = defineComponent({
  name: 'SigninView',
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const router = useRouter()
    const route = useRoute()
    const signinForm = builder.buildSigninForm(
      {
        context: app,
        onSubmit: async (user: SigninUser) => {
          try {
            await app.signin(user.username, user.password)
            await router.replace(String(route.query.redirect ?? '/BASE/'))
          } catch (error) {
            await app.toast({} as any, {
              severity: 'error',
              detail:
                error instanceof Error
                  ? error.message
                  : String(error ?? '登录失败'),
              summary: '错误',
              life: 3000,
            })
          }
        },
      },
      { title: () => null },
    )

    return () =>
      h('div', { class: 'mmda-signin-page' }, [
        h('div', { class: 'mmda-signin-card' }, [
          h('header', { class: 'mmda-signin-card__header' }, [
            h('p', { class: 'mmda-signin-card__eyebrow' }, 'MMDA'),
            h('h1', { class: 'mmda-signin-card__title' }, '统一应用登录'),
            h(
              'p',
              { class: 'mmda-signin-card__subtitle' },
              '一次登录，访问基础数据与制造执行功能。',
            ),
          ]),
          h('div', { class: 'mmda-signin-card__body' }, [signinForm]),
        ]),
      ])
  },
})

import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type UiBuilder,
} from '@mmda/vui'
import { defineComponent, h, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

function authErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const problem = error as {
      detail?: unknown
      message?: unknown
      title?: unknown
      status?: unknown
    }
    const status = Number(problem.status)
    if (typeof problem.detail === 'string' && problem.detail.trim()) {
      return problem.detail
    }
    if (typeof problem.message === 'string' && problem.message.trim()) {
      return problem.message
    }
    if (status === 503) {
      return '基础服务不可用，请确认 mmda-base 等后端服务已启动'
    }
    if (typeof problem.title === 'string' && problem.title.trim()) {
      return problem.title
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return String(error ?? '登录失败')
}

export const SigninView = defineComponent({
  name: 'SigninView',
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as UiBuilder
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const router = useRouter()
    const route = useRoute()
    const formError = ref('')
    const signinForm = builder.buildSigninForm(
      {
        context: app,
        onSignin: async (user: SigninUser) => {
          formError.value = ''
          try {
            await app.signin(user.username, user.password)
            await router.replace(String(route.query.redirect ?? '/BASE/'))
          } catch (error) {
            const detail = authErrorMessage(error)
            formError.value = detail
            await app.toast({} as any, {
              severity: 'error',
              detail,
              summary: '登录失败',
              life: 5000,
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
          formError.value
            ? h(
                'div',
                {
                  class: 'mmda-signin-card__error',
                  role: 'alert',
                },
                formError.value,
              )
            : null,
          h('div', { class: 'mmda-signin-card__body' }, [signinForm]),
        ]),
      ])
  },
})

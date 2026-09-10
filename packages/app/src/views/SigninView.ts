import { uiCssClass } from '@mmda/core'
import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type VueUiBuilder,
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

/**
 * 登录路由页：`layoutPage` + `factory.card` + `buildSigninForm`。
 */
export const SigninView = defineComponent({
  name: 'SigninView',
  setup() {
    const builder = inject(UI_BUILDER_KEY)! as VueUiBuilder
    const app = inject(UI_APP_KEY)! as MmdaApplication
    const router = useRouter()
    const route = useRoute()
    const formError = ref('')
    const signinForm = builder.buildSigninForm!(
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
            await app.ui.toast({} as any, {
              severity: 'error',
              title: '登录失败',
              message: detail,
              life: 5000,
            })
          }
        },
      },
      { title: () => null },
    )

    return () =>
      builder.layout.layoutPage({
        primary: [
          builder.factory.card(
            {
              surface: 'elevated',
            },
            {
              header: () => [
                h('p', { class: uiCssClass('signin-form', 'brand') }, 'MMDA'),
                h(
                  'h1',
                  { class: uiCssClass('signin-form', 'heading') },
                  '统一应用登录',
                ),
                h(
                  'p',
                  { class: uiCssClass('signin-form', 'lead') },
                  '一次登录，访问基础数据与制造执行功能。',
                ),
              ],
              default: () => [
                formError.value
                  ? h(
                      'p',
                      { class: uiCssClass('signin-form', 'error') },
                      formError.value,
                    )
                  : null,
                signinForm,
              ],
            },
          ),
        ],
      })
  },
})

import { uiCssClass } from '@mmda/core'
import {
  UI_APP_KEY,
  UI_BUILDER_KEY,
  type MmdaApplication,
  type SigninUser,
  type VuiBuilder,
} from '@mmda/vui'
import { defineComponent, h, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    error.name === 'TypeError' ||
    /failed to fetch|networkerror|network error|load failed|econnrefused|err_connection/i.test(
      message,
    )
  )
}

function authErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return '无法连接服务器，请确认网关（8001）与认证服务已启动'
  }

  if (error && typeof error === 'object') {
    const problem = error as {
      detail?: unknown
      message?: unknown
      title?: unknown
      status?: unknown
    }
    const status = Number(problem.status)
    const detail =
      typeof problem.detail === 'string' ? problem.detail.trim() : ''
    const message =
      typeof problem.message === 'string' ? problem.message.trim() : ''
    const title =
      typeof problem.title === 'string' ? problem.title.trim() : ''
    const combined = `${detail} ${message} ${title}`

    if (/clientid|clientsecret|oauth client/i.test(combined)) {
      return '登录配置不完整：缺少 OAuth clientId/clientSecret，请检查前端环境变量'
    }
    if (detail) return detail
    if (message) {
      if (
        /failed to fetch|networkerror|network error|load failed/i.test(message)
      ) {
        return '无法连接服务器，请确认网关（8001）与认证服务已启动'
      }
      return message
    }
    if (status === 401 || status === 400) {
      return '用户名或密码错误'
    }
    if (status === 503) {
      return '基础服务不可用，请确认 mmda-base 等后端服务已启动'
    }
    if (status === 500) {
      return '认证服务返回错误，请检查用户名密码或服务日志'
    }
    if (title) return title
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
    const builder = inject(UI_BUILDER_KEY)! as VuiBuilder
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
            try {
              await app.ui.toast({} as any, {
                severity: 'error',
                title: '登录失败',
                message: detail,
                life: 5000,
              })
            } catch {
              // toast 失败时仍保留页面红字提示
            }
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
                      {
                        class: uiCssClass('signin-form', 'error'),
                        role: 'alert',
                      },
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

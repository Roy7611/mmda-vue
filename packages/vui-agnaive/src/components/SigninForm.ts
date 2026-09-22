import { required, uiCssClass } from '@mmda/core'
import {
  UI_BUILDER_KEY,
  invokeSignin,
  resolveSigninHandlers,
  signinFormEmits,
  signinFormProps,
  type SigninUser,
  type VuiBuilder,
} from '@mmda/vui'
import { NCheckbox, NInput } from 'naive-ui'
import {
  defineComponent,
  h,
  inject,
  onBeforeMount,
  reactive,
  ref,
  withModifiers,
} from 'vue'
import { useI18n } from 'vue-i18n'

export const SigninForm = defineComponent({
  name: 'AgNaiveSigninForm',
  props: signinFormProps,
  emits: signinFormEmits,
  setup(props, { emit, slots }) {
    const builder = inject(UI_BUILDER_KEY)! as VuiBuilder
    const { t } = useI18n()
    const user = reactive<SigninUser>({
      signinMode: props.mode ?? 'password',
      username: '',
      password: '',
      agreed: true,
    })
    const v = reactive({
      username: { message: '' },
      password: { message: '' },
      agreed: { message: '' },
    })
    const loading = ref(false)
    const formError = ref('')
    const tx = (message: string) => (message ? t(message) : message)

    const validate = () => {
      v.username.message = tx(required(user.username, user) as string)
      v.password.message = tx(required(user.password, user) as string)
      v.agreed.message = user.agreed ? '' : t('auth.agreeTermsRequired')
      return !(v.username.message || v.password.message || v.agreed.message)
    }

    const handleLogin = async () => {
      formError.value = ''
      if (!validate()) {
        formError.value =
          v.agreed.message ||
          t('auth.fillUsernamePassword') ||
          '请填写用户名和密码'
        return
      }
      const emitSignin = emit as (event: 'signin', user: SigninUser) => unknown
      const handlers = resolveSigninHandlers(emitSignin)
      loading.value = true
      const payload: SigninUser = { ...user }
      try {
        await props.context?.localDb?.put?.('user/username', {
          username: user.username,
        })
        await invokeSignin(emitSignin, payload, handlers)
      } catch (error) {
        formError.value =
          error instanceof Error && error.message.trim()
            ? error.message
            : String(error ?? '登录失败')
      } finally {
        loading.value = false
      }
    }

    onBeforeMount(async () => {
      const stored = await props.context?.localDb?.get?.('user/username')
      if (stored?.username) user.username = stored.username
    })

    return () => {
      const { layout, factory } = builder
      return h(
        'form',
        {
          class: uiCssClass('signin-form'),
          onSubmit: withModifiers(handleLogin, ['prevent']),
        },
        [
          loading.value
            ? h(
                'div',
                { class: uiCssClass('signin-form', 'loading') },
                factory.loading({ size: 'small' }),
              )
            : null,
          slots.header?.(),
          formError.value
            ? h(
                'p',
                { class: uiCssClass('signin-form', 'error') },
                formError.value,
              )
            : null,
          layout.layoutFieldVert({
            label: h(
              'label',
              { class: uiCssClass('field-label') },
              t('auth.username') || 'Username',
            ),
            control: h(NInput, {
              value: user.username,
              placeholder: t('auth.username') || 'Username',
              status: v.username.message ? 'error' : undefined,
              'onUpdate:value': (value: string) => (user.username = value),
            }),
            message: v.username.message || undefined,
          }),
          layout.layoutFieldVert({
            label: h(
              'label',
              { class: uiCssClass('field-label') },
              t('auth.password') || 'Password',
            ),
            control: h(NInput, {
              type: 'password',
              showPasswordOn: 'click',
              value: user.password,
              placeholder: t('auth.password') || 'Password',
              status: v.password.message ? 'error' : undefined,
              'onUpdate:value': (value: string) => (user.password = value),
            }),
            message: v.password.message || undefined,
          }),
          h(
            NCheckbox,
            {
              checked: user.agreed,
              'onUpdate:checked': (value: boolean) => (user.agreed = value),
            },
            { default: () => t('auth.agreeTerms') || 'Agree' },
          ),
          v.agreed.message
            ? h(
                'small',
                { class: `${uiCssClass('field-message')} error` },
                v.agreed.message,
              )
            : null,
          factory.button({
            label: loading.value
              ? t('auth.signingIn') || 'Signing in'
              : t('auth.signin') || 'Sign in',
            colorRole: 'primary',
            class: uiCssClass('signin-form', 'login'),
            disabled: loading.value,
            type: 'submit',
            onClick: () => {
              void handleLogin()
            },
          }),
          slots.footer?.(),
        ],
      )
    }
  },
})

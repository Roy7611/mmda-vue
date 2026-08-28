import { required } from '@mmda/core'
import {
  signinFormEmits,
  signinFormProps,
  type SigninFormProps,
  type SigninUser,
} from '@mmda/vui'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import ProgressSpinner from 'primevue/progressspinner'
import {
  defineComponent,
  h,
  onBeforeMount,
  reactive,
  withModifiers,
  type VNodeProps,
} from 'vue'
import { useI18n } from 'vue-i18n'

export const SigninForm = defineComponent({
  name: 'SigninForm',
  props: signinFormProps,
  emits: signinFormEmits,
  setup(props: SigninFormProps, { emit, slots }) {
    const { t } = useI18n()
    const user = reactive<SigninUser>({
      signinMode: props.mode ?? 'password',
      username: '',
      password: '',
      agreed: true,
    })
    const v = reactive({
      username: { touched: false, message: '' },
      password: { touched: false, message: '' },
      agreed: { touched: false, message: '' },
    })

    const tx = (message: string) => (message ? t(message) : message)

    const requiredUsername = () => {
      v.username.touched = true
      v.username.message = tx(required(user.username) as string)
    }
    const requiredPassword = () => {
      v.password.touched = true
      v.password.message = tx(required(user.password) as string)
    }
    const requiredAgreed = () => {
      v.agreed.touched = true
      v.agreed.message = user.agreed ? '' : t('auth.agreeTermsRequired')
    }

    const validate = () => {
      requiredUsername()
      requiredPassword()
      requiredAgreed()
      return !(v.username.message || v.password.message || v.agreed.message)
    }

    const handleLogin = async () => {
      if (!validate()) return
      if (props.context?.loginLoading) props.context.loginLoading.value = true
      const payload: SigninUser = {
        signinMode: user.signinMode,
        username: user.username,
        password: user.password,
        agreed: user.agreed,
      }
      try {
        await props.context?.localDb?.put?.('user/username', {
          username: user.username,
        })
        emit('submit', payload)
        if (props.onSubmit) {
          await props.onSubmit(payload)
        }
      } finally {
        if (props.context?.loginLoading) props.context.loginLoading.value = false
      }
    }

    onBeforeMount(async () => {
      try {
        const saved = await props.context?.localDb?.get?.<{ username?: string }>(
          'user/username',
        )
        if (saved?.username) user.username = saved.username
      } catch {
        // ignore
      }
    })

    return () => {
      const loading = !!props.context?.loginLoading?.value
      return h('div', { class: 'mmda-signin-form-wrap' }, [
        loading
          ? h(
              'div',
              { class: 'mmda-signin-form__loading' },
              h(ProgressSpinner as any, { strokeWidth: '4' }),
            )
          : null,
        h('form', { class: 'mmda-prime-auth-form', onSubmit: withModifiers(() => {}, ['prevent']) }, [
          slots?.header?.(),
          slots.title
            ? slots.title()
            : h('h2', { class: 'mmda-signin-form__title' }, t('auth.signin')),
          h('label', { class: 'mmda-signin-form__field', for: 'username' }, [
            t('auth.username'),
            h(InputText, {
              id: 'username',
              class: 'w-full',
              autocomplete: 'username',
              modelValue: user.username,
              placeholder: t('auth.username'),
              'onUpdate:modelValue': (value: string) => {
                user.username = value
                if (v.username.touched) requiredUsername()
              },
              onBlur: requiredUsername,
            } as VNodeProps),
            v.username.message
              ? h('small', { class: 'mmda-signin-form__error' }, v.username.message)
              : null,
          ]),
          h('label', { class: 'mmda-signin-form__field', for: 'password' }, [
            t('auth.password'),
            h(Password, {
              inputId: 'password',
              class: 'w-full',
              feedback: false,
              toggleMask: true,
              modelValue: user.password,
              placeholder: t('auth.password'),
              'onUpdate:modelValue': (value: string) => {
                user.password = value
                if (v.password.touched) requiredPassword()
              },
              onBlur: requiredPassword,
              inputProps: {
                autocomplete: 'current-password',
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleLogin()
                  }
                },
              },
            } as VNodeProps),
            v.password.message
              ? h('small', { class: 'mmda-signin-form__error' }, v.password.message)
              : null,
          ]),
          h('label', { class: 'mmda-signin-form__agreed' }, [
            h(Checkbox, {
              inputId: 'agreed',
              binary: true,
              modelValue: user.agreed,
              'onUpdate:modelValue': (value: boolean) => {
                user.agreed = value
                if (v.agreed.touched) requiredAgreed()
              },
              onBlur: requiredAgreed,
            } as VNodeProps),
            t('auth.agreeTermsRequired'),
          ]),
          v.agreed.message
            ? h('small', { class: 'mmda-signin-form__error' }, v.agreed.message)
            : null,
          h(Button, {
            type: 'button',
            class: 'w-full',
            label: loading ? t('auth.signingIn') : t('auth.signin'),
            loading,
            icon: 'pi pi-sign-in',
            onClick: withModifiers(() => void handleLogin(), ['prevent']),
          } as VNodeProps),
          slots?.bottomNav?.(),
          slots?.thirdParty?.(),
        ]),
      ])
    }
  },
})

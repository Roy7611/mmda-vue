import { defineComponent, h, onBeforeMount, reactive, withModifiers } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NCheckbox, NInput, NSpin } from 'naive-ui'
import { required } from '@mmda/core'
import {
  signinFormEmits,
  signinFormProps,
  type SigninUser,
} from '@mmda/vui'

export const SigninForm = defineComponent({
  name: 'AgNaiveSigninForm',
  props: signinFormProps,
  emits: signinFormEmits,
  setup(props, { emit, slots }) {
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
    const tx = (message: string) => (message ? t(message) : message)

    const validate = () => {
      v.username.message = tx(required(user.username, user) as string)
      v.password.message = tx(required(user.password, user) as string)
      v.agreed.message = user.agreed ? '' : t('auth.agreeTermsRequired')
      return !(v.username.message || v.password.message || v.agreed.message)
    }

    const handleLogin = async () => {
      if (!validate()) return
      if (props.context?.loginLoading) props.context.loginLoading.value = true
      const payload: SigninUser = { ...user }
      try {
        await props.context?.localDb?.put?.('user/username', {
          username: user.username,
        })
        emit('signin', payload)
      } finally {
        if (props.context?.loginLoading)
          props.context.loginLoading.value = false
      }
    }

    onBeforeMount(async () => {
      const stored = await props.context?.localDb?.get?.('user/username')
      if (stored?.username) user.username = stored.username
    })

    return () =>
      h(
        'form',
        {
          class: 'mmda-agnaive-auth-form',
          onSubmit: withModifiers(handleLogin, ['prevent']),
        },
        [
          slots.header?.(),
          h(NInput, {
            value: user.username,
            placeholder: t('auth.username') || 'Username',
            status: v.username.message ? 'error' : undefined,
            'onUpdate:value': (value: string) => (user.username = value),
          }),
          v.username.message
            ? h('p', { class: 'mmda-agnaive-error' }, v.username.message)
            : null,
          h(NInput, {
            type: 'password',
            showPasswordOn: 'click',
            value: user.password,
            placeholder: t('auth.password') || 'Password',
            status: v.password.message ? 'error' : undefined,
            'onUpdate:value': (value: string) => (user.password = value),
          }),
          v.password.message
            ? h('p', { class: 'mmda-agnaive-error' }, v.password.message)
            : null,
          h(
            NCheckbox,
            {
              checked: user.agreed,
              'onUpdate:checked': (value: boolean) => (user.agreed = value),
            },
            { default: () => t('auth.agreeTerms') || 'Agree' },
          ),
          h(
            NButton,
            { type: 'primary', attrType: 'submit', block: true },
            {
              default: () =>
                props.context?.loginLoading?.value
                  ? h(NSpin, { size: 'small' })
                  : t('auth.signin') || 'Sign in',
            },
          ),
          slots.footer?.(),
        ],
      )
  },
})

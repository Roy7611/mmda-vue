import { required } from '@mmda/core'
import {
  signinFormEmits,
  signinFormProps,
  type SigninFormProps,
  type SigninUser,
} from '@mmda/vui'
import { ButtonComponent, CheckBoxComponent } from '@syncfusion/ej2-vue-buttons'
import { TextBoxComponent } from '@syncfusion/ej2-vue-inputs'
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
      v.username.message = tx(required(user.username, user) as string)
    }
    const requiredPassword = () => {
      v.password.touched = true
      v.password.message = tx(required(user.password, user) as string)
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
        const saved = await props.context?.localDb?.get?.('user/username')
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
              h('div', { class: 'e-icons e-spin mmda-signin-form__spinner' }),
            )
          : null,
        h(
          'form',
          {
            class: 'mmda-sf-auth-form mmda-signin-form',
            onSubmit: withModifiers(() => {}, ['prevent']),
          },
          [
            slots?.header?.(),
            slots.title
              ? slots.title()
              : h('h2', { class: 'mmda-signin-form__title' }, t('auth.signin')),
            h('div', { class: 'mmda-signin-form__field' }, [
              h(
                'label',
                { class: 'mmda-signin-form__label', for: 'username' },
                t('auth.username'),
              ),
              h(TextBoxComponent as any, {
                id: 'username',
                cssClass: 'e-outline mmda-signin-form__control',
                floatLabelType: 'Never',
                value: user.username,
                placeholder: t('auth.username'),
                input: (args: any) => {
                  user.username = args.value
                  if (v.username.touched) requiredUsername()
                },
                blur: requiredUsername,
              } as VNodeProps),
              v.username.message
                ? h(
                    'small',
                    { class: 'mmda-signin-form__error' },
                    v.username.message,
                  )
                : null,
            ]),
            h('div', { class: 'mmda-signin-form__field' }, [
              h(
                'label',
                { class: 'mmda-signin-form__label', for: 'password' },
                t('auth.password'),
              ),
              h(TextBoxComponent as any, {
                id: 'password',
                type: 'password',
                cssClass: 'e-outline mmda-signin-form__control',
                floatLabelType: 'Never',
                value: user.password,
                placeholder: t('auth.password'),
                input: (args: any) => {
                  user.password = args.value
                  if (v.password.touched) requiredPassword()
                },
                blur: requiredPassword,
                keydown: (args: any) => {
                  if (args?.event?.key === 'Enter' || args?.key === 'Enter') {
                    args?.event?.preventDefault?.()
                    void handleLogin()
                  }
                },
              } as VNodeProps),
              v.password.message
                ? h(
                    'small',
                    { class: 'mmda-signin-form__error' },
                    v.password.message,
                  )
                : null,
            ]),
            h('label', { class: 'mmda-signin-form__agreed' }, [
              h(CheckBoxComponent as any, {
                checked: user.agreed,
                change: (args: any) => {
                  user.agreed = args.checked
                  if (v.agreed.touched) requiredAgreed()
                },
              } as VNodeProps),
              h('span', { class: 'mmda-signin-form__agreed-text' }, t('auth.agreeTermsRequired')),
            ]),
            v.agreed.message
              ? h('small', { class: 'mmda-signin-form__error' }, v.agreed.message)
              : null,
            h(ButtonComponent as any, {
              cssClass: 'e-primary e-block mmda-signin-form__submit',
              content: loading ? t('auth.signingIn') : t('auth.signin'),
              iconCss: 'e-icons e-lock',
              onClick: withModifiers(() => void handleLogin(), ['prevent']),
            } as VNodeProps),
            slots?.bottomNav?.(),
            slots?.thirdParty?.(),
          ],
        ),
      ])
    }
  },
})

import { required, uiCssClass } from '@mmda/core'
import {
  UI_BUILDER_KEY,
  signinFormEmits,
  signinFormProps,
  type SigninUser,
  type VueUiBuilder,
} from '@mmda/vui'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import {
  defineComponent,
  h,
  inject,
  onBeforeMount,
  reactive,
  withModifiers,
  ref,
  type VNodeProps,
} from 'vue'
import { useI18n } from 'vue-i18n'

export const SigninForm = defineComponent({
  name: 'SigninForm',
  props: signinFormProps,
  emits: signinFormEmits,
  setup(props, { emit, slots }) {
    const builder = inject(UI_BUILDER_KEY)! as VueUiBuilder
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

    const loading = ref(false)
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
      loading.value = true
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
        emit('signin', payload)
      } finally {
        loading.value = false
      }
    }

    onBeforeMount(async () => {
      try {
        const saved = (await (props.context?.localDb as any)?.get?.(
          'user/username',
        )) as { username?: string } | undefined
        if (saved?.username) user.username = saved.username
      } catch {
        // ignore
      }
    })

    return () => {
      const { layout, factory } = builder
      return h(
        'form',
        {
          class: uiCssClass('signin-form'),
          onSubmit: withModifiers(() => {}, ['prevent']),
        },
        [
          loading.value
            ? h(
                'div',
                { class: uiCssClass('signin-form', 'loading') },
                factory.loading(),
              )
            : null,
          slots?.header?.(),
          slots.title
            ? slots.title()
            : h(
                'h2',
                { class: uiCssClass('signin-form', 'title') },
                t('auth.signin'),
              ),
          layout.layoutFieldVert({
            label: h(
              'label',
              { class: uiCssClass('field-label'), for: 'username' },
              t('auth.username'),
            ),
            control: h(InputText, {
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
            message: v.username.message || undefined,
          }),
          layout.layoutFieldVert({
            label: h(
              'label',
              { class: uiCssClass('field-label'), for: 'password' },
              t('auth.password'),
            ),
            control: h(Password, {
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
            message: v.password.message || undefined,
          }),
          h('label', { class: uiCssClass('signin-form', 'agreed') }, [
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
            h('span', null, t('auth.agreeTermsRequired')),
          ]),
          v.agreed.message
            ? h(
                'small',
                { class: `${uiCssClass('field-message')} error` },
                v.agreed.message,
              )
            : null,
          factory.button({
            label: loading.value ? t('auth.signingIn') : t('auth.signin'),
            colorRole: 'primary',
            icon: 'pi pi-sign-in',
            class: uiCssClass('signin-form', 'login'),
            disabled: loading.value,
            onClick: withModifiers(() => void handleLogin(), ['prevent']),
          }),
          slots?.bottomNav?.(),
          slots?.thirdParty?.(),
        ],
      )
    }
  },
})

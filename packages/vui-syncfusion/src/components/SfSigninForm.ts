import { required, uiCssClass } from '@mmda/core'
import {
  UI_BUILDER_KEY,
  signinFormEmits,
  signinFormProps,
  type SigninUser,
  type VueUiBuilder,
} from '@mmda/vui'
import { CheckBoxComponent } from '@syncfusion/ej2-vue-buttons'
import { TextBoxComponent } from '@syncfusion/ej2-vue-inputs'
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

export const SfSigninForm = defineComponent({
  name: 'SfSigninForm',
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
        const saved = await props.context?.localDb?.get?.('user/username')
        if (saved?.username) user.username = saved.username
      } catch {
        // ignore
      }
    })

    return () => {
      const { layout, factory } = builder
      const children = [
        slots?.header?.(),
        slots.title
          ? slots.title()
          : h('h2', { class: uiCssClass('signin-form', 'title') }, t('auth.signin')),
        layout.layoutFieldVert({
          label: h(
            'label',
            { class: uiCssClass('field-label'), for: 'username' },
            t('auth.username'),
          ),
          control: h(TextBoxComponent as any, {
            id: 'username',
            cssClass: 'e-outline',
            floatLabelType: 'Never',
            value: user.username,
            placeholder: t('auth.username'),
            input: (args: any) => {
              user.username = args.value
              if (v.username.touched) requiredUsername()
            },
            blur: requiredUsername,
          } as VNodeProps),
          message: v.username.message || undefined,
        }),
        layout.layoutFieldVert({
          label: h(
            'label',
            { class: uiCssClass('field-label'), for: 'password' },
            t('auth.password'),
          ),
          control: h(TextBoxComponent as any, {
            id: 'password',
            type: 'password',
            cssClass: 'e-outline',
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
          message: v.password.message || undefined,
        }),
        h('label', { class: uiCssClass('signin-form', 'agreed') }, [
          h(CheckBoxComponent as any, {
            checked: user.agreed,
            change: (args: any) => {
              user.agreed = args.checked
              if (v.agreed.touched) requiredAgreed()
            },
          } as VNodeProps),
          h('span', null, t('auth.agreeTermsRequired')),
        ]),
        v.agreed.message
          ? h(
              'small',
              {
                class: `${uiCssClass('field-message')} error`,
              },
              v.agreed.message,
            )
          : null,
        factory.button({
          label: loading.value ? t('auth.signingIn') : t('auth.signin'),
          colorRole: 'primary',
          icon: 'e-icons e-lock',
          class: `${uiCssClass('signin-form', 'login')} e-block`,
          disabled: loading.value,
          onClick: withModifiers(() => void handleLogin(), ['prevent']),
        }),
        slots?.bottomNav?.(),
        slots?.thirdParty?.(),
      ]

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
          ...children,
        ],
      )
    }
  },
})

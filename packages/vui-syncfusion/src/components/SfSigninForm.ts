import { required, uiCssClass, uiClassModifiers } from '@mmda/core'
import {
  invokeSignin,
  resolveSigninHandlers,
  signinFormEmits,
  signinFormProps,
  type SigninUser,
} from '@mmda/vui'
import { CheckBoxComponent } from '@syncfusion/ej2-vue-buttons'
import { TextBoxComponent } from '@syncfusion/ej2-vue-inputs'
import { ProgressButtonComponent } from '@syncfusion/ej2-vue-splitbuttons'
import {
  defineComponent,
  h,
  onBeforeMount,
  reactive,
  ref,
  watch,
  withModifiers,
  type VNode,
  type VNodeProps,
} from 'vue'
import { useI18n } from 'vue-i18n'

function fieldVert(label: VNode, control: VNode, message?: string) {
  return h(
    'div',
    {
      class: uiClassModifiers('field', 'vertical'),
      style: { minWidth: 0 },
    },
    [
      label,
      h(
        'div',
        { class: uiCssClass('field-control'), style: { minWidth: 0 } },
        [control],
      ),
      message
        ? h(
            'small',
            { class: `${uiCssClass('field-message')} error` },
            message,
          )
        : null,
    ],
  )
}

export const SfSigninForm = defineComponent({
  name: 'SfSigninForm',
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
      username: { touched: false, message: '' },
      password: { touched: false, message: '' },
      agreed: { touched: false, message: '' },
    })

    const loading = ref(false)
    const progressRef = ref<{
      ej2Instances?: {
        start?: (percent?: number) => void
        stop?: () => void
        progressComplete?: () => void
      }
    } | null>(null)

    const progressApi = () => progressRef.value?.ej2Instances
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

    const stopProgress = () => {
      loading.value = false
      const api = progressApi()
      // stop 只暂停进度；progressComplete 才会 hideSpin、去掉 e-progress-active
      api?.stop?.()
      api?.progressComplete?.()
    }

    const handleLogin = async () => {
      if (loading.value) return
      // ProgressButton 一点就自己转；校验失败也要停
      if (!validate()) {
        stopProgress()
        return
      }
      const emitSignin = emit as (event: 'signin', user: SigninUser) => unknown
      const handlers = resolveSigninHandlers(emitSignin)
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
        await invokeSignin(emitSignin, payload, handlers)
      } finally {
        stopProgress()
      }
    }

    watch(loading, (busy) => {
      const api = progressApi()
      if (!api) return
      if (busy) api.start?.()
      else {
        api.stop?.()
        api.progressComplete?.()
      }
    })

    onBeforeMount(async () => {
      try {
        const saved = await props.context?.localDb?.get?.('user/username')
        if (saved?.username) user.username = saved.username
      } catch {
        // ignore
      }
    })

    return () => {
      const children = [
        slots?.header?.(),
        slots.title
          ? slots.title()
          : h(
              'h2',
              { class: uiCssClass('signin-form', 'title') },
              t('auth.signin'),
            ),
        fieldVert(
          h(
            'label',
            { class: uiCssClass('field-label'), for: 'username' },
            t('auth.username'),
          ),
          h(TextBoxComponent as any, {
            htmlAttributes: {
              id: 'username',
              autocomplete: 'username',
            },
            floatLabelType: 'Never',
            value: user.username,
            placeholder: t('auth.username'),
            input: (args: { value?: string }) => {
              user.username = args.value ?? ''
              if (v.username.touched) requiredUsername()
            },
            blur: requiredUsername,
          } as VNodeProps),
          v.username.message || undefined,
        ),
        fieldVert(
          h(
            'label',
            { class: uiCssClass('field-label'), for: 'password' },
            t('auth.password'),
          ),
          h(TextBoxComponent as any, {
            type: 'password',
            htmlAttributes: {
              id: 'password',
              autocomplete: 'current-password',
            },
            floatLabelType: 'Never',
            value: user.password,
            placeholder: t('auth.password'),
            input: (args: { value?: string }) => {
              user.password = args.value ?? ''
              if (v.password.touched) requiredPassword()
            },
            blur: requiredPassword,
          } as VNodeProps),
          v.password.message || undefined,
        ),
        h('label', { class: uiCssClass('signin-form', 'agreed') }, [
          h(CheckBoxComponent as any, {
            checked: user.agreed,
            change: (args: { checked?: boolean }) => {
              user.agreed = Boolean(args.checked)
              if (v.agreed.touched) requiredAgreed()
            },
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
        h(ProgressButtonComponent as any, {
          ref: progressRef,
          content: loading.value ? t('auth.signingIn') : t('auth.signin'),
          iconCss: 'e-icons e-lock',
          isPrimary: true,
          disabled: loading.value,
          // 长 duration，由 start/end 跟 loading 控制，避免默认 2s 自动结束
          duration: 1e8,
          spinSettings: { position: 'Left' },
          cssClass: `${uiCssClass('signin-form', 'login')} e-block`,
          click: () => {
            void handleLogin()
          },
        } as VNodeProps),
        slots?.bottomNav?.(),
        slots?.thirdParty?.(),
      ]

      return h(
        'form',
        {
          class: uiCssClass('signin-form'),
          onSubmit: withModifiers(() => {
            void handleLogin()
          }, ['prevent']),
        },
        children,
      )
    }
  },
})

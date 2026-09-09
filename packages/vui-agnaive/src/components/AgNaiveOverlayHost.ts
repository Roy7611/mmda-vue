import { defineComponent, h, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NButton,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NModal,
  NNotificationProvider,
  useDialog,
  useMessage,
} from 'naive-ui'
import {
  dialogButtonColorRole,
  dialogFooterKind,
  dialogHeaderKind,
  isDialogPrimaryButton,
  resolveDialogButtons,
  type UiDialogButton,
} from '@mmda/core'
import { UI_APP_KEY, type MmdaVueApp } from '@mmda/vui'
import {
  closeOverlayDialog,
  type AgNaiveOverlay,
} from '../agnaive_overlay'
import {
  naiveLocaleOf,
  naiveOverridesRef,
  naiveSkinState,
  naiveThemeRef,
} from '../agnaive_theme'

const DEFAULT_LABELS: Record<UiDialogButton, string> = {
  ok: 'OK',
  cancel: 'Cancel',
  yes: 'Yes',
  no: 'No',
  abort: 'Abort',
  retry: 'Retry',
  ignore: 'Ignore',
}

function naiveTypeForRole(
  role?: string,
  primary = false,
): 'default' | 'primary' | 'error' | 'success' | 'warning' | 'info' {
  if (role === 'danger') return 'error'
  if (role === 'success') return 'success'
  if (role === 'warning') return 'warning'
  if (role === 'info') return 'info'
  if (role === 'primary' || primary) return 'primary'
  return 'default'
}

const OverlayInner = defineComponent({
  name: 'AgNaiveOverlayInner',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaVueApp | undefined
    const overlay = app?.ui.overlay as AgNaiveOverlay | undefined
    const message = useMessage()
    const dialog = useDialog()

    if (overlay) {
      overlay.services.toast = props => {
        const text = String(props.message ?? props.title ?? '')
        const type = props.severity ?? 'info'
        if (type === 'error') message.error(text)
        else if (type === 'warning') message.warning(text)
        else if (type === 'success') message.success(text)
        else message.info(text)
      }
      overlay.services.confirm = props =>
        new Promise(resolve => {
          dialog.warning({
            title: String(props.title ?? ''),
            content: String(props.message ?? ''),
            positiveText: 'OK',
            negativeText: 'Cancel',
            onPositiveClick: () => resolve(true),
            onNegativeClick: () => resolve(false),
          })
        })
    }

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    const labelOf = (button: UiDialogButton) => {
      const key = `dialog.${button}`
      const translated = translate?.(key)
      if (translated && translated !== key) return translated
      return DEFAULT_LABELS[button]
    }

    return () => {
      const dialogs = overlay?.dialogs ?? []
      return h(
        'div',
        { class: 'mmda-agnaive-overlays' },
        dialogs.map(request => {
          const width =
            typeof request.props.width === 'number'
              ? `${request.props.width}px`
              : request.props.width ?? 'min(90vw, 60rem)'
          const headerKind = dialogHeaderKind(request.props)
          const footerKind = dialogFooterKind(request.props)
          const standard = resolveDialogButtons(request.props.buttons)
          const custom = request.props.customActions ?? []
          const slots: Record<string, unknown> = {
            default: () => request.content,
          }
          if (headerKind === 'slot') {
            slots.header = () => request.props.header!()
          }
          if (footerKind === 'slot') {
            slots.action = () => request.props.footer!()
          } else if (footerKind === 'buttons') {
            slots.action = () =>
              h(
                'div',
                {
                  class: 'mmda-agnaive-dialog__footer',
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    width: '100%',
                  },
                },
                [
                  h(
                    'div',
                    { class: 'mmda-agnaive-dialog__footer-start' },
                    custom.map(action =>
                      h(
                        NButton,
                        {
                          type: naiveTypeForRole(action.colorRole),
                          onClick: () =>
                            void action.onAction?.(request.context as any),
                        },
                        {
                          default: () => action.label ?? action.name ?? '',
                        },
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { class: 'mmda-agnaive-dialog__footer-end' },
                    standard.map(button => {
                      const role = dialogButtonColorRole(button)
                      return h(
                        NButton,
                        {
                          type: naiveTypeForRole(
                            role,
                            isDialogPrimaryButton(button),
                          ),
                          onClick: () =>
                            void closeOverlayDialog(
                              overlay!,
                              request,
                              button,
                            ),
                        },
                        { default: () => labelOf(button) },
                      )
                    }),
                  ),
                ],
              )
          }
          return h(
            NModal,
            {
              key: request.id,
              show: true,
              preset: 'dialog',
              title: headerKind === 'title' ? request.props.title : undefined,
              style: { width },
              class: 'mmda-agnaive-dialog',
              onAfterEnter: () => request.props.onOpen?.(),
              'onUpdate:show': (show: boolean) => {
                if (!show) void closeOverlayDialog(overlay!, request, 'cancel')
              },
            },
            slots,
          )
        }),
      )
    }
  },
})

export const AgNaiveOverlayHost = defineComponent({
  name: 'AgNaiveOverlayHost',
  setup() {
    return () => {
      const loc = naiveLocaleOf(naiveSkinState.locale)
      return h(
        NConfigProvider,
        {
          theme: naiveThemeRef.value,
          themeOverrides: naiveOverridesRef.value,
          locale: loc.locale,
          dateLocale: loc.dateLocale,
        },
        {
          default: () =>
            h(NMessageProvider, null, {
              default: () =>
                h(NDialogProvider, null, {
                  default: () =>
                    h(NNotificationProvider, null, {
                      default: () => h(OverlayInner),
                    }),
                }),
            }),
        },
      )
    }
  },
})

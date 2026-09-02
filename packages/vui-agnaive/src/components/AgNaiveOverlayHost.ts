import { computed, defineComponent, h, inject } from 'vue'
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
  useNotification,
} from 'naive-ui'
import { UI_APP_KEY, type MmdaApplication } from '@mmda/vui'
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

const OverlayInner = defineComponent({
  name: 'AgNaiveOverlayInner',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaApplication | undefined
    const overlay = app?.ui.overlay as AgNaiveOverlay | undefined
    const message = useMessage()
    const dialog = useDialog()
    const notification = useNotification()

    if (overlay) {
      overlay.services.factory = app?.ui.factory
      overlay.services.toast = props => {
        const text = String(props.detail ?? props.message ?? props.summary ?? '')
        const type = props.severity ?? props.type ?? 'info'
        if (type === 'error' || type === 'danger') message.error(text)
        else if (type === 'warning' || type === 'warn') message.warning(text)
        else if (type === 'success') message.success(text)
        else message.info(text)
        if (props.group === 'notification') {
          notification.create({ title: props.summary ?? props.title, content: text })
        }
      }
      overlay.services.confirm = props =>
        new Promise(resolve => {
          dialog.warning({
            title: String(props.header ?? props.title ?? ''),
            content: String(props.message ?? ''),
            positiveText: String(
              (props.acceptProps as any)?.label ?? 'OK',
            ),
            negativeText: String(
              (props.rejectProps as any)?.label ?? 'Cancel',
            ),
            onPositiveClick: () => {
              props.accept?.()
              resolve('yes')
            },
            onNegativeClick: () => {
              props.reject?.()
              resolve('no')
            },
          })
        })
    }

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    const cancelLabel = computed(
      () => translate?.('dialog.cancel') || 'Cancel',
    )
    const okLabel = computed(() => translate?.('dialog.ok') || 'OK')

    return () => {
      const factory = overlay?.services.factory
      const dialogs = overlay?.dialogs ?? []
      return h(
        'div',
        { class: 'mmda-agnaive-overlays' },
        dialogs.map(request => {
          const width =
            typeof request.props.width === 'number'
              ? `${request.props.width}px`
              : request.props.width ?? 'min(90vw, 60rem)'
          const dialogProps = {
            show: true,
            title: request.props.title ?? request.props.name,
            style: { width },
            class: ['mmda-agnaive-dialog', request.props.cssClass]
              .filter(Boolean)
              .join(' '),
            onClose: () => closeOverlayDialog(overlay!, request, false),
            'onUpdate:show': (show: boolean) => {
              if (!show) void closeOverlayDialog(overlay!, request, false)
            },
          }
          const slots = {
            default: () => request.content,
            action:
              request.props.showFooter === false
                ? undefined
                : () =>
                    h('div', { class: 'mmda-agnaive-dialog__footer' }, [
                      h(
                        NButton,
                        {
                          onClick: () =>
                            closeOverlayDialog(overlay!, request, false),
                        },
                        { default: () => cancelLabel.value },
                      ),
                      h(
                        NButton,
                        {
                          type: 'primary',
                          onClick: () =>
                            closeOverlayDialog(overlay!, request, true),
                        },
                        { default: () => okLabel.value },
                      ),
                    ]),
          }
          return factory
            ? factory.dialog(
                {
                  visible: true,
                  onUpdateVisible: (visible: boolean) => {
                    if (!visible)
                      void closeOverlayDialog(overlay!, request, false)
                  },
                  ...dialogProps,
                },
                slots,
              )
            : h(
                NModal,
                {
                  key: request.id,
                  show: true,
                  preset: 'dialog',
                  title: dialogProps.title,
                  style: dialogProps.style,
                  class: dialogProps.class,
                  'onUpdate:show': dialogProps['onUpdate:show'],
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

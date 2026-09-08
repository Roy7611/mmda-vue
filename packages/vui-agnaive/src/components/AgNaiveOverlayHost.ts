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
} from 'naive-ui'
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

    const cancelLabel = computed(
      () => translate?.('dialog.cancel') || 'Cancel',
    )
    const okLabel = computed(() => translate?.('dialog.ok') || 'OK')

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
          return h(
            NModal,
            {
              key: request.id,
              show: true,
              preset: 'dialog',
              title: request.props.title,
              style: { width },
              class: ['mmda-agnaive-dialog', request.props.cssClass]
                .filter(Boolean)
                .join(' '),
              'onUpdate:show': (show: boolean) => {
                if (!show) void closeOverlayDialog(overlay!, request, false)
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

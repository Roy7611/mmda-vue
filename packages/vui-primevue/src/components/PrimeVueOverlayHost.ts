import { computed, defineComponent, h, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { usePrimeVue } from 'primevue/config'
import { UI_APP_KEY, type MmdaVueApp } from "@mmda/vui";
import {
  closeOverlayDialog,
  type PrimeOverlay,
} from '../prime_overlay'

export const PrimeVueOverlayHost = defineComponent({
  name: 'PrimeVueOverlayHost',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaVueApp | undefined
    const overlay = app?.ui.overlay as PrimeOverlay | undefined

    try {
      if (overlay) overlay.services.toast = useToast()
    } catch {
      /* ToastService not installed (unit tests) */
    }
    try {
      if (overlay) overlay.services.confirm = useConfirm()
    } catch {
      /* ConfirmationService not installed */
    }

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    let primeLocale: Record<string, string> | undefined
    try {
      primeLocale = usePrimeVue().config.locale as Record<string, string>
    } catch {
      primeLocale = undefined
    }

    const cancelLabel = computed(
      () => translate?.('dialog.cancel') || primeLocale?.cancel || 'Cancel',
    )
    const okLabel = computed(
      () => translate?.('dialog.ok') || primeLocale?.accept || 'OK',
    )

    return () => {
      const dialogs = overlay?.dialogs ?? []
      return h('div', { class: 'mmda-prime-overlays' }, [
        h(Toast),
        h(ConfirmDialog),
        ...dialogs.map(request => {
          const height =
            typeof request.props.height === 'number'
              ? `${request.props.height}px`
              : request.props.height
          const maxHeight =
            typeof request.props.maxHeight === 'number'
              ? `${request.props.maxHeight}px`
              : request.props.maxHeight ?? '90vh'
          const dialogProps = {
            visible: true,
            modal: request.props.modal ?? true,
            header: request.props.title,
            style: {
              width:
                typeof request.props.width === 'number'
                  ? `${request.props.width}px`
                  : request.props.width ?? 'min(90vw, 60rem)',
              ...(height ? { height } : {}),
              maxHeight,
            },
            pt: {
              root: {
                class: ['mmda-prime-dialog', request.props.cssClass]
                  .filter(Boolean)
                  .join(' '),
              },
              content: { class: 'mmda-prime-dialog__body' },
            },
            maximizable: true,
            onHide: () => closeOverlayDialog(overlay!, request, false),
            'onUpdate:visible': (visible: boolean) => {
              if (!visible) void closeOverlayDialog(overlay!, request, false)
            },
          }
          const slots = {
            default: () => request.content,
            footer:
              request.props.showFooter === false
                ? undefined
                : () =>
                    h('div', { class: 'mmda-prime-dialog__footer' }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          class: 'p-button p-button-text',
                          onClick: () =>
                            closeOverlayDialog(overlay!, request, false),
                        },
                        cancelLabel.value,
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: 'p-button',
                          onClick: () =>
                            closeOverlayDialog(overlay!, request, true),
                        },
                        okLabel.value,
                      ),
                    ]),
          }
          return h(Dialog, { key: request.id, ...dialogProps }, slots)
        }),
      ])
    }
  },
})

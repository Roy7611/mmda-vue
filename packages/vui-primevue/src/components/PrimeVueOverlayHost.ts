import { computed, defineComponent, h, reactive, type VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import DynamicDialog from 'primevue/dynamicdialog'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { usePrimeVue } from 'primevue/config'
import type { UiDialogPropsType } from '@mmda/vui'

let toastService: ReturnType<typeof useToast> | undefined
let confirmService: ReturnType<typeof useConfirm> | undefined

interface DialogRequest {
  id: number
  content: VNode
  props: UiDialogPropsType
  resolve: (accepted: boolean) => void
}

const dialogs = reactive<DialogRequest[]>([])
let nextDialogId = 1

export function getPrimeToastService() {
  return toastService
}

export function getPrimeConfirmService() {
  return confirmService
}

export function openPrimeDialog(content: VNode, props: UiDialogPropsType) {
  return new Promise<boolean>(resolve => {
    dialogs.push({ id: nextDialogId++, content, props, resolve })
  })
}

async function closeDialog(request: DialogRequest, accepted: boolean) {
  if (accepted) {
    if (request.props.accept && (await request.props.accept()) === false) return
    request.props.onConfirm?.()
  } else if (request.props.reject && (await request.props.reject()) === false) {
    return
  }
  request.props.onClose?.()
  dialogs.splice(dialogs.indexOf(request), 1)
  request.resolve(accepted)
}

export const PrimeVueOverlayHost = defineComponent({
  name: 'PrimeVueOverlayHost',
  setup() {
    try {
      toastService = useToast()
    } catch {
      toastService = undefined
    }
    try {
      confirmService = useConfirm()
    } catch {
      confirmService = undefined
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

    return () =>
      h('div', { class: 'mmda-prime-overlays' }, [
        h(Toast),
        h(Toast, { group: 'br', position: 'bottom-right' }),
        h(Toast, { group: 'notification', position: 'top-right' }),
        h(ConfirmDialog),
        h(ConfirmPopup, { group: 'ConfirmPopup' }),
        h(DynamicDialog),
        ...dialogs.map(request =>
          h(
            Dialog,
            {
              key: request.id,
              visible: true,
              modal: request.props.modal ?? true,
              header: request.props.title ?? request.props.name,
              style: {
                width:
                  typeof request.props.width === 'number'
                    ? `${request.props.width}px`
                    : request.props.width ?? 'min(90vw, 60rem)',
              },
              maximizable: true,
              onHide: () => closeDialog(request, false),
              'onUpdate:visible': (visible: boolean) => {
                if (!visible) void closeDialog(request, false)
              },
            },
            {
              default: () => request.content,
              footer: () =>
                h('div', { class: 'mmda-prime-dialog__footer' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'p-button p-button-text',
                      onClick: () => closeDialog(request, false),
                    },
                    cancelLabel.value,
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'p-button',
                      onClick: () => closeDialog(request, true),
                    },
                    okLabel.value,
                  ),
                ]),
            },
          ),
        ),
      ])
  },
})

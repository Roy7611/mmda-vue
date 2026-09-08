import { reactive, type VNode } from 'vue'
import type { UiOverlay } from '@mmda/vui'
import type {
  UiConfirmProps,
  UiDialogProps,
  UiToastProps,
} from '@mmda/vui'

export interface DialogRequest {
  id: number
  content: VNode
  props: UiDialogProps
  resolve: (accepted: boolean) => void
}

export interface PrimeOverlayServices {
  toast?: { add: (message: Record<string, unknown>) => void }
  confirm?: {
    require: (options: Record<string, unknown>) => void
  }
}

export interface PrimeOverlay extends UiOverlay {
  dialogs: DialogRequest[]
  services: PrimeOverlayServices
}

let nextDialogId = 1

export function createPrimeOverlay(): PrimeOverlay {
  const dialogs = reactive<DialogRequest[]>([])
  const services: PrimeOverlayServices = {}

  const overlay: PrimeOverlay = {
    dialogs,
    services,
    toast(props: UiToastProps) {
      services.toast?.add({
        severity: props.severity ?? 'info',
        summary: props.title,
        detail: props.message,
        life: props.life ?? 3000,
      })
    },
    confirm(props: UiConfirmProps) {
      const service = services.confirm
      if (!service) {
        const accepted =
          typeof window !== 'undefined' &&
          window.confirm(String(props.message ?? 'Confirm?'))
        return Promise.resolve(accepted)
      }
      return new Promise<boolean>(resolve => {
        service.require({
          message: String(props.message ?? ''),
          header: props.title,
          accept: () => resolve(true),
          reject: () => resolve(false),
        })
      })
    },
    dialog(content, props) {
      return new Promise<boolean>(resolve => {
        dialogs.push({ id: nextDialogId++, content, props, resolve })
      })
    },
    async settleTopDialog(accepted) {
      const top = dialogs[dialogs.length - 1]
      if (top) await closeOverlayDialog(overlay, top, accepted)
    },
  }
  return overlay
}

export async function closeOverlayDialog(
  overlay: PrimeOverlay,
  request: DialogRequest,
  accepted: boolean,
) {
  if (accepted) {
    if (request.props.onAccept && (await request.props.onAccept()) === false)
      return
    request.props.onConfirm?.()
  } else if (
    request.props.onReject &&
    (await request.props.onReject()) === false
  ) {
    return
  }
  request.props.onClose?.()
  overlay.dialogs.splice(overlay.dialogs.indexOf(request), 1)
  request.resolve(accepted)
}

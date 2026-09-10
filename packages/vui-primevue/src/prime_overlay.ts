import { reactive, type VNode } from 'vue'
import type {
  UiContext,
  UiConfirmProps,
  UiDialogAction,
  UiDialogProps,
  UiToastProps,
} from '@mmda/core'
import { shouldCloseDialog } from '@mmda/core'
import type { UiOverlay } from '@mmda/vui'

export interface DialogRequest {
  id: number
  content: VNode
  props: UiDialogProps
  context?: UiContext
  resolve: (button: UiDialogAction) => void
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
    dialog(content, props, context) {
      return new Promise<UiDialogAction>(resolve => {
        dialogs.push({
          id: nextDialogId++,
          content,
          props,
          context,
          resolve,
        })
      })
    },
    async closeTopDialog(button) {
      const top = dialogs[dialogs.length - 1]
      if (top) await closeOverlayDialog(overlay, top, button)
    },
  }
  return overlay
}

export async function closeOverlayDialog(
  overlay: PrimeOverlay,
  request: DialogRequest,
  button: UiDialogAction,
) {
  if (!(await shouldCloseDialog(request.props, button))) {
    return
  }
  request.props.onClose?.(button)
  overlay.dialogs.splice(overlay.dialogs.indexOf(request), 1)
  request.resolve(button)
}

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

export interface AgNaiveOverlayServices {
  toast?: (props: UiToastProps) => void
  confirm?: (props: UiConfirmProps) => Promise<boolean>
}

export interface AgNaiveOverlay extends UiOverlay {
  dialogs: DialogRequest[]
  services: AgNaiveOverlayServices
}

let nextDialogId = 1

export function createAgNaiveOverlay(): AgNaiveOverlay {
  const dialogs = reactive<DialogRequest[]>([])
  const services: AgNaiveOverlayServices = {}

  const overlay: AgNaiveOverlay = {
    dialogs,
    services,
    toast(props: UiToastProps) {
      services.toast?.(props)
    },
    confirm(props: UiConfirmProps) {
      if (services.confirm) return services.confirm(props)
      const accepted =
        typeof window !== 'undefined' &&
        window.confirm(String(props.message ?? 'Confirm?'))
      return Promise.resolve(accepted)
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
  overlay: AgNaiveOverlay,
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

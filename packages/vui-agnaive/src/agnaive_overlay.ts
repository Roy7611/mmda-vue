import { shallowReactive, type VNode } from 'vue'
import type {
  UiContext,
  UiConfirmProps,
  UiDialogAction,
  UiDialogProps,
  UiMessageProps,
  UiToastProps,
} from '@mmda/core'
import { shouldCloseDialog } from '@mmda/core'
import type { VuiOverlay } from '@mmda/vui'

export interface AgNaiveVuiDialogRequest {
  id: number
  content: VNode
  props: UiDialogProps
  context?: UiContext
  resolve: (button: UiDialogAction) => void
}

export interface AgNaiveVuiOverlayServices {
  toast?: (props: UiToastProps) => void
  confirm?: (props: UiConfirmProps) => Promise<boolean>
}

export interface AgNaiveVuiOverlay extends VuiOverlay {
  dialogs: AgNaiveVuiDialogRequest[]
  services: AgNaiveVuiOverlayServices
}

let nextDialogId = 1

export function createAgNaiveVuiOverlay(): AgNaiveVuiOverlay {
  const dialogs = shallowReactive<AgNaiveVuiDialogRequest[]>([])
  const services: AgNaiveVuiOverlayServices = {}

  const overlay: AgNaiveVuiOverlay = {
    dialogs,
    services,
    toast(props: UiToastProps) {
      services.toast?.(props)
    },
    message(props: UiMessageProps) {
      overlay.toast({
        severity: props.severity,
        message: props.content,
      })
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
  overlay: AgNaiveVuiOverlay,
  request: AgNaiveVuiDialogRequest,
  button: UiDialogAction,
) {
  if (!(await shouldCloseDialog(request.props, button))) {
    return
  }
  request.props.onClose?.(button)
  overlay.dialogs.splice(overlay.dialogs.indexOf(request), 1)
  request.resolve(button)
}

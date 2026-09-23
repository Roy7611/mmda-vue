import { h, shallowReactive, type VNode } from 'vue'
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

export interface SfVuiDialogRequest {
  id: number
  content: VNode
  props: UiDialogProps
  context?: UiContext
  resolve: (button: UiDialogAction) => void
}

export interface SfVuiOverlayServices {
  toast?: { show: (model: Record<string, unknown>) => void }
}

export interface SfVuiOverlay extends VuiOverlay {
  dialogs: SfVuiDialogRequest[]
  services: SfVuiOverlayServices
}

let nextDialogId = 1

const severityClass = (severity?: string) => {
  const map: Record<string, string> = {
    success: 'e-toast-success',
    info: 'e-toast-info',
    warning: 'e-toast-warning',
    error: 'e-toast-danger',
  }
  return map[severity ?? 'info'] ?? 'e-toast-info'
}

export function createSfVuiOverlay(): SfVuiOverlay {
  const dialogs = shallowReactive<SfVuiDialogRequest[]>([])
  const services: SfVuiOverlayServices = {}

  const overlay: SfVuiOverlay = {
    dialogs,
    services,
    toast(props: UiToastProps) {
      const content = String(props.message ?? '')
      const title = props.title ?? ''
      const model = {
        title,
        content,
        cssClass: severityClass(props.severity),
        timeOut: props.life ?? 3000,
        position: { X: 'Right', Y: 'Top' },
      }
      if (services.toast?.show) {
        services.toast.show(model)
        return
      }
      if (typeof window !== 'undefined' && content) {
        window.setTimeout(() => {
          if (services.toast?.show) services.toast.show(model)
          else window.alert([title, content].filter(Boolean).join('\n'))
        }, 0)
      }
    },
    message(props: UiMessageProps) {
      overlay.toast({
        severity: props.severity,
        message: props.content,
      })
    },
    async confirm(props: UiConfirmProps) {
      const button = await overlay.dialog(
        h('div', String(props.message ?? '')),
        {
          title: props.title,
          buttons: 'okCancel',
          width: '22rem',
          enableResize: false,
        },
      )
      return button === 'ok' || button === 'yes'
    },
    dialog(content: VNode, props: UiDialogProps, context?: UiContext) {
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
    async closeTopDialog(button: UiDialogAction) {
      const top = dialogs[dialogs.length - 1]
      if (top) await closeOverlayDialog(overlay, top, button)
    },
  }
  return overlay
}

export async function closeOverlayDialog(
  overlay: SfVuiOverlay,
  request: SfVuiDialogRequest,
  button: UiDialogAction,
) {
  if (!(await shouldCloseDialog(request.props, button))) {
    return
  }
  request.props.onClose?.(button)
  overlay.dialogs.splice(overlay.dialogs.indexOf(request), 1)
  request.resolve(button)
}

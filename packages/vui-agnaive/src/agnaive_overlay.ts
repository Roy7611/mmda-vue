import { reactive, type VNode } from 'vue'
import type { UiFactory, UiOverlay } from '@mmda/vui'
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiMessageBoxResult,
  UiToastProps,
} from '@mmda/vui'

export interface DialogRequest {
  id: number
  content: VNode
  props: UiDialogPropsType
  resolve: (accepted: boolean) => void
}

export interface AgNaiveOverlayServices {
  toast?: (props: UiToastProps) => void
  confirm?: (props: UiMessageBoxProps) => Promise<UiMessageBoxResult>
  factory?: UiFactory
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
    confirm(props: UiMessageBoxProps) {
      if (services.confirm) return services.confirm(props)
      const accepted =
        typeof window !== 'undefined' &&
        window.confirm(String(props.message ?? 'Confirm?'))
      return Promise.resolve(accepted ? 'yes' : 'no')
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
  overlay: AgNaiveOverlay,
  request: DialogRequest,
  accepted: boolean,
) {
  if (accepted) {
    if (request.props.accept && (await request.props.accept()) === false) return
    request.props.onConfirm?.()
  } else if (request.props.reject && (await request.props.reject()) === false) {
    return
  }
  request.props.onClose?.()
  overlay.dialogs.splice(overlay.dialogs.indexOf(request), 1)
  request.resolve(accepted)
}

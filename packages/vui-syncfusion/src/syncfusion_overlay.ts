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

export interface SyncfusionOverlayServices {
  toast?: { show: (model: Record<string, unknown>) => void }
  factory?: UiFactory
}

export interface SyncfusionOverlay extends UiOverlay {
  dialogs: DialogRequest[]
  services: SyncfusionOverlayServices
}

let nextDialogId = 1

const severityClass = (severity?: string) => {
  const map: Record<string, string> = {
    success: 'e-toast-success',
    info: 'e-toast-info',
    warning: 'e-toast-warning',
    warn: 'e-toast-warning',
    error: 'e-toast-danger',
    danger: 'e-toast-danger',
  }
  return map[severity ?? 'info'] ?? 'e-toast-info'
}

export function createSyncfusionOverlay(): SyncfusionOverlay {
  const dialogs = reactive<DialogRequest[]>([])
  const services: SyncfusionOverlayServices = {}

  const overlay: SyncfusionOverlay = {
    dialogs,
    services,
    toast(props: UiToastProps) {
      services.toast?.show({
        title: props.summary ?? props.title ?? '',
        content: String(props.detail ?? props.message ?? ''),
        cssClass: severityClass(props.severity ?? props.type),
        timeOut: props.life ?? 3000,
        position: { X: 'Right', Y: 'Top' },
      })
    },
    async confirm(props: UiMessageBoxProps) {
      try {
        const { DialogUtility } = await import('@syncfusion/ej2-popups')
        return await new Promise<UiMessageBoxResult>(resolve => {
          const dlg = DialogUtility.confirm({
            title: props.header ?? props.title,
            content: String(props.message ?? ''),
            okButton: {
              click: () => {
                props.accept?.()
                dlg.hide()
                resolve('yes')
              },
            },
            cancelButton: {
              click: () => {
                props.reject?.()
                dlg.hide()
                resolve('no')
              },
            },
          })
        })
      } catch {
        const accepted =
          typeof window !== 'undefined' &&
          window.confirm(String(props.message ?? 'Confirm?'))
        return accepted ? 'yes' : 'no'
      }
    },
    dialog(content: VNode, props: UiDialogPropsType) {
      return new Promise<boolean>(resolve => {
        dialogs.push({ id: nextDialogId++, content, props, resolve })
      })
    },
    async settleTopDialog(accepted: boolean) {
      const top = dialogs[dialogs.length - 1]
      if (top) await closeOverlayDialog(overlay, top, accepted)
    },
  }
  return overlay
}

export async function closeOverlayDialog(
  overlay: SyncfusionOverlay,
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

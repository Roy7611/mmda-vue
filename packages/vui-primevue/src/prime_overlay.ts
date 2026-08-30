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

export interface PrimeOverlayServices {
  toast?: { add: (message: Record<string, unknown>) => void }
  confirm?: {
    require: (options: Record<string, unknown>) => void
  }
  factory?: UiFactory
}

export interface PrimeOverlay extends UiOverlay {
  dialogs: DialogRequest[]
  services: PrimeOverlayServices
}

let nextDialogId = 1

export function createPrimeOverlay(): PrimeOverlay {
  const dialogs = reactive<DialogRequest[]>([])
  const services: PrimeOverlayServices = {}

  return {
    dialogs,
    services,
    toast(props: UiToastProps) {
      services.toast?.add({
        severity: props.severity ?? props.type ?? 'info',
        summary: props.summary ?? props.title,
        detail: props.detail ?? props.message,
        group: props.group,
        life: props.life ?? 3000,
      })
    },
    confirm(props: UiMessageBoxProps) {
      const service = services.confirm
      if (!service) {
        const accepted =
          typeof window !== 'undefined' &&
          window.confirm(String(props.message ?? 'Confirm?'))
        return Promise.resolve(accepted ? 'yes' : 'no')
      }
      return new Promise<UiMessageBoxResult>(resolve => {
        service.require({
          message: String(props.message ?? ''),
          header: props.header,
          icon: props.icon,
          rejectProps: props.rejectProps,
          acceptProps: props.acceptProps,
          accept: () => {
            props.accept?.()
            resolve('yes')
          },
          reject: () => {
            props.reject?.()
            resolve('no')
          },
        })
      })
    },
    dialog(content, props) {
      return new Promise<boolean>(resolve => {
        dialogs.push({ id: nextDialogId++, content, props, resolve })
      })
    },
  }
}

export async function closeOverlayDialog(
  overlay: PrimeOverlay,
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

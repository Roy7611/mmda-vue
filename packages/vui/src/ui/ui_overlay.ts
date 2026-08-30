import { h, render, type VNode } from 'vue'
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiMessageBoxResult,
  UiToastProps,
} from './ui_dialog'

export interface UiOverlay {
  toast(props: UiToastProps): void
  confirm(props: UiMessageBoxProps): Promise<UiMessageBoxResult>
  dialog(content: VNode, props: UiDialogPropsType): Promise<boolean>
}

export function createHtmlOverlay(): UiOverlay {
  return {
    toast(props) {
      if (typeof document === 'undefined') return
      const node = document.createElement('div')
      node.className = `mmda-toast is-${props.severity ?? props.type ?? 'info'}`
      node.textContent = String(
        props.detail ?? props.message ?? props.summary ?? props.title ?? '',
      )
      document.body.append(node)
      setTimeout(() => node.remove(), props.life ?? 3000)
    },
    confirm(props) {
      if (typeof window === 'undefined') return Promise.resolve('no')
      return Promise.resolve(
        window.confirm(String(props.message ?? 'Confirm?')) ? 'yes' : 'no',
      )
    },
    dialog(content, props) {
      if (typeof document === 'undefined') return Promise.resolve(false)
      return new Promise(resolve => {
        const host = document.createElement('div')
        document.body.append(host)
        const close = (accepted: boolean) => {
          render(null, host)
          host.remove()
          props.onClose?.()
          resolve(accepted)
        }
        const accept = async () => {
          if (props.accept && (await props.accept()) === false) return
          props.onConfirm?.()
          close(true)
        }
        const reject = async () => {
          if (props.reject && (await props.reject()) === false) return
          close(false)
        }
        render(
          h('div', { class: 'mmda-dialog-backdrop' }, [
            h(
              'section',
              {
                class: 'mmda-dialog',
                style: { width: props.width ?? 'min(90vw, 60rem)' },
              },
              [
                h('header', props.title ?? props.name),
                h('main', [content]),
                h('footer', [
                  h('button', { type: 'button', onClick: reject }, 'Cancel'),
                  h('button', { type: 'button', onClick: accept }, 'OK'),
                ]),
              ],
            ),
          ]),
          host,
        )
        props.onOpen?.()
      })
    },
  }
}

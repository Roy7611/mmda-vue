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
  /** 关闭最上层对话框（如选择列表双击确认）。 */
  settleTopDialog?(accepted: boolean): Promise<void>
}

export function createHtmlOverlay(): UiOverlay {
  const stack: Array<(accepted: boolean) => Promise<void>> = []
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
    async settleTopDialog(accepted) {
      const top = stack[stack.length - 1]
      if (top) await top(accepted)
    },
    dialog(content, props) {
      if (typeof document === 'undefined') return Promise.resolve(false)
      return new Promise(resolve => {
        const host = document.createElement('div')
        document.body.append(host)
        const close = async (accepted: boolean) => {
          if (accepted) {
            if (props.accept && (await props.accept()) === false) return
            props.onConfirm?.()
          } else if (props.reject && (await props.reject()) === false) {
            return
          }
          const idx = stack.lastIndexOf(close)
          if (idx >= 0) stack.splice(idx, 1)
          render(null, host)
          host.remove()
          props.onClose?.()
          resolve(accepted)
        }
        stack.push(close)
        const accept = () => close(true)
        const reject = () => close(false)
        render(
          h('div', { class: 'mmda-dialog-backdrop' }, [
            h(
              'section',
              {
                class: ['mmda-dialog', props.cssClass].filter(Boolean).join(' '),
                style: {
                  width: props.width ?? 'min(90vw, 60rem)',
                  height: props.height,
                  maxHeight: props.maxHeight ?? '90vh',
                },
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

import { h, render, type VNode } from 'vue'
import type {
  UiConfirmProps,
  UiDialogProps,
  UiToastProps,
} from '../factory/dialog'

export interface UiOverlay {
  toast(props: UiToastProps): void
  confirm(props: UiConfirmProps): Promise<boolean>
  dialog(content: VNode, props: UiDialogProps): Promise<boolean>
  /** 关闭最上层对话框（如选择列表双击确认）。 */
  settleTopDialog?(accepted: boolean): Promise<void>
}

export function createHtmlOverlay(): UiOverlay {
  const stack: Array<(accepted: boolean) => Promise<void>> = []
  return {
    toast(props) {
      if (typeof document === 'undefined') return
      const node = document.createElement('div')
      node.className = `mmda-toast is-${props.severity ?? 'info'}`
      node.textContent = [props.title, props.message ?? props.detail]
        .filter(Boolean)
        .join(' ')
      document.body.append(node)
      setTimeout(() => node.remove(), props.life ?? 3000)
    },
    confirm(props) {
      if (typeof window === 'undefined') return Promise.resolve(false)
      const text = [props.title, props.message].filter(Boolean).join('\n')
      return Promise.resolve(window.confirm(text || 'Confirm?'))
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
            if (props.onAccept && (await props.onAccept()) === false) return
            props.onConfirm?.()
          } else if (props.onReject && (await props.onReject()) === false) {
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
                h('header', props.title ?? ''),
                h('main', [content]),
                props.showFooter === false
                  ? null
                  : h('footer', [
                      h(
                        'button',
                        { type: 'button', onClick: () => close(false) },
                        'Cancel',
                      ),
                      h(
                        'button',
                        { type: 'button', onClick: () => close(true) },
                        'OK',
                      ),
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

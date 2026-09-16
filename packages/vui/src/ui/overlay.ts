import { h, render, type VNode } from 'vue'
import type { UiContext, UiOverlay as CoreUiOverlay } from '@mmda/core'
import {
  dialogButtonColorRole,
  dialogFooterKind,
  dialogHeaderKind,
  isDialogPrimaryButton,
  resolveDialogButtons,
  shouldCloseDialog,
  type UiConfirmProps,
  type UiDialogAction,
  type UiDialogProps,
  type UiDialogSeverity,
  type UiToastProps,
} from '@mmda/core'

/** core UiOverlay 钉成 VNode；无额外方法则 type 别名。 */
export type VueUiOverlay = CoreUiOverlay<VNode>
/** @deprecated 用 VueUiOverlay */
export type UiOverlay = VueUiOverlay
/** 弹层内容；框架节点具象为 VNode。 */
export type UiDialogContent = VNode | VNode[]
/** @deprecated 用 UiDialogSeverity */
export type UiToastSeverity = UiDialogSeverity

function buttonLabel(button: UiDialogAction): string {
  const defaults: Record<UiDialogAction, string> = {
    ok: 'OK',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    abort: 'Abort',
    retry: 'Retry',
    ignore: 'Ignore',
  }
  return defaults[button]
}

export function createHtmlOverlay(): VueUiOverlay {
  const stack: Array<(button: UiDialogAction) => Promise<void>> = []
  return {
    toast(props: UiToastProps) {
      if (typeof document === 'undefined') return
      const node = document.createElement('div')
      node.className = `mmda-toast is-${props.severity ?? 'info'}`
      node.textContent = [props.title, props.message].filter(Boolean).join(' ')
      document.body.append(node)
      setTimeout(() => node.remove(), props.life ?? 3000)
    },
    confirm(props: UiConfirmProps) {
      if (typeof window === 'undefined') return Promise.resolve(false)
      const text = [props.title, props.message].filter(Boolean).join('\n')
      return Promise.resolve(window.confirm(text || 'Confirm?'))
    },
    async closeTopDialog(button) {
      const top = stack[stack.length - 1]
      if (top) await top(button)
    },
    dialog(content: VNode, props: UiDialogProps, context?: UiContext) {
      if (typeof document === 'undefined') return Promise.resolve('cancel' as const)
      return new Promise(resolve => {
        const host = document.createElement('div')
        document.body.append(host)
        const close = async (button: UiDialogAction) => {
          if (!(await shouldCloseDialog(props, button))) return
          const idx = stack.lastIndexOf(close)
          if (idx >= 0) stack.splice(idx, 1)
          render(null, host)
          host.remove()
          props.onClose?.(button)
          resolve(button)
        }
        stack.push(close)
        const headerKind = dialogHeaderKind(props)
        const footerKind = dialogFooterKind(props)
        const headerNode =
          headerKind === 'slot'
            ? h('header', props.header!())
            : h('header', props.title ?? '')
        const footerNode =
          footerKind === 'none'
            ? null
            : footerKind === 'slot'
              ? h('footer', { class: 'mmda-dialog__footer' }, props.footer!())
              : h(
                  'footer',
                  {
                    class: 'mmda-dialog__footer',
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    },
                  },
                  [
                    h(
                      'div',
                      { class: 'mmda-dialog__footer-start' },
                      (props.customActions ?? []).map(action =>
                        h(
                          'button',
                          {
                            type: 'button',
                            onClick: () => void action.onAction?.(context as any),
                          },
                          action.label ?? action.name ?? '',
                        ),
                      ),
                    ),
                    h(
                      'div',
                      { class: 'mmda-dialog__footer-end' },
                      resolveDialogButtons(props.buttons).map(button =>
                        h(
                          'button',
                          {
                            type: 'button',
                            class: isDialogPrimaryButton(button)
                              ? 'is-primary'
                              : undefined,
                            'data-color-role': dialogButtonColorRole(button),
                            onClick: () => void close(button),
                          },
                          buttonLabel(button),
                        ),
                      ),
                    ),
                  ],
                )
        render(
          h('div', { class: 'mmda-dialog-backdrop' }, [
            h(
              'section',
              {
                class: 'mmda-dialog',
                style: {
                  width: props.width ?? 'min(90vw, 60rem)',
                  height: props.height,
                  maxHeight: props.maxHeight ?? '90vh',
                },
              },
              [headerNode, h('main', [content]), footerNode],
            ),
          ]),
          host,
        )
        props.onOpen?.()
      })
    },
  }
}

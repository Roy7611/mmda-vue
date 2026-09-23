import { createElement, useSyncExternalStore, type ReactElement, type ReactNode } from 'react'
import { ToastComponent } from '@syncfusion/ej2-react-notifications'
import { DialogComponent } from '@syncfusion/ej2-react-popups'
import {
  isDialogPrimaryButton,
  resolveDialogButtons,
  type UiConfirmProps,
  type UiContext,
  type UiDialogAction,
  type UiDialogProps,
  type UiMessageProps,
  type UiOverlay,
  type UiToastProps,
} from '@mmda/core'

/**
 * 弹层渲染请求。命令式 {@link SfRuiOverlay} 与声明式宿主之间的数据契约，
 * 宿主负责把它们渲染成 Syncfusion toast / dialog。
 */
export interface SfRuiToastRequest {
  id: number
  props: UiToastProps
}

export interface SfRuiDialogRequest {
  id: number
  content: ReactNode
  props: UiDialogProps<ReactNode>
  resolve: (action: UiDialogAction) => void
}

type SfRuiListener = () => void

/**
 * Syncfusion EJ2 React 命令式弹层宿主。实现 core {@link UiOverlay}。
 *
 * toast / dialog 的状态都收在本类内部；`SfRuiOverlayHost` 挂载后订阅单例渲染，
 * 不再有散落的模块级函数。
 */
export class SfRuiOverlay implements UiOverlay<ReactNode> {
  private readonly toasts: SfRuiToastRequest[] = []
  private readonly dialogs: SfRuiDialogRequest[] = []
  private readonly listeners = new Set<SfRuiListener>()
  private nextId = 1
  private version = 0

  subscribe = (listener: SfRuiListener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getVersion = (): number => this.version

  getToasts = (): readonly SfRuiToastRequest[] => this.toasts

  getDialogs = (): readonly SfRuiDialogRequest[] => this.dialogs

  private notify(): void {
    this.version += 1
    for (const listener of this.listeners) listener()
  }

  toast(props: UiToastProps): void {
    const id = this.nextId++
    this.toasts.push({ id, props })
    this.notify()
    const life = props.life ?? 3000
    setTimeout(() => {
      const index = this.toasts.findIndex((item) => item.id === id)
      if (index >= 0) this.toasts.splice(index, 1)
      this.notify()
    }, life)
  }

  message(props: UiMessageProps): void {
    this.toast({ severity: props.severity, message: props.content })
  }

  async confirm(props: UiConfirmProps): Promise<boolean> {
    const button = await this.dialog(
      createElement('div', null, props.message),
      {
        title: props.title,
        buttons: 'okCancel',
        width: '22rem',
        enableResize: false,
      },
    )
    return button === 'ok' || button === 'yes'
  }

  dialog(
    content: ReactNode,
    props: UiDialogProps<ReactNode>,
    _context?: UiContext,
  ): Promise<UiDialogAction> {
    return new Promise((resolve) => {
      this.dialogs.push({ id: this.nextId++, content, props, resolve })
      this.notify()
    })
  }

  resolveDialog(request: SfRuiDialogRequest, action: UiDialogAction): void {
    const index = this.dialogs.indexOf(request)
    if (index < 0) return
    this.dialogs.splice(index, 1)
    this.notify()
    request.resolve(action)
  }

  async closeTopDialog(action: UiDialogAction): Promise<void> {
    const top = this.dialogs[this.dialogs.length - 1]
    if (top) this.resolveDialog(top, action)
  }
}

export const sfRuiOverlay = new SfRuiOverlay()

/**
 * SfRuiOverlayHost — Syncfusion React overlay 宿主。
 * 挂载在应用根组件内，订阅 {@link sfRuiOverlay} 渲染 toast / dialog。
 */
export function SfRuiOverlayHost(): ReactElement | null {
  useSyncExternalStore(sfRuiOverlay.subscribe, sfRuiOverlay.getVersion)

  const toasts = sfRuiOverlay.getToasts()
  const dialogs = sfRuiOverlay.getDialogs()
  const latestToast = toasts[toasts.length - 1]

  const resolveDialog = (req: SfRuiDialogRequest, action: UiDialogAction): void =>
    sfRuiOverlay.resolveDialog(req, action)

  return createElement(
    'div',
    { className: 'mmda-overlay-host' },
    latestToast &&
      createElement(ToastComponent, {
        key: `toast-${latestToast.id}`,
        title: latestToast.props.title,
        content: String(latestToast.props.message ?? ''),
        cssClass: severityClass(latestToast.props.severity),
        timeOut: latestToast.props.life ?? 3000,
        position: { X: 'Right', Y: 'Top' },
      }),
    dialogs.map((req) =>
      createElement(
        DialogComponent,
        {
          key: `dlg-${req.id}`,
          header: req.props.title,
          visible: true,
          showCloseIcon: req.props.showCloseIcon !== false,
          isModal: req.props.modal !== false,
          width: req.props.width ?? 'auto',
          height: req.props.height ?? 'auto',
          allowDragging: req.props.allowDragging !== false,
          enableResize: req.props.enableResize !== false,
          closeOnEscape: req.props.closeOnEscape,
          open: () => req.props.onOpen?.(),
          close: () => {
            resolveDialog(req, 'cancel')
            req.props.onClose?.('cancel')
          },
          buttons: buildDialogButtons(req.props, req, resolveDialog),
        },
        req.content ?? null,
      ),
    ),
  )
}

function severityClass(severity?: string): string {
  const map: Record<string, string> = {
    success: 'e-toast-success',
    info: 'e-toast-info',
    warning: 'e-toast-warning',
    error: 'e-toast-danger',
  }
  return map[severity ?? 'info'] ?? 'e-toast-info'
}

function buildDialogButtons(
  props: UiDialogProps,
  req: SfRuiDialogRequest,
  resolve: (req: SfRuiDialogRequest, action: UiDialogAction) => void,
): unknown {
  const names = resolveDialogButtons(props.buttons)
  return names.map((name) => ({
    buttonModel: {
      content: name.charAt(0).toUpperCase() + name.slice(1),
      isPrimary: isDialogPrimaryButton(name),
      cssClass: isDialogPrimaryButton(name) ? 'e-primary' : 'e-secondary',
    },
    click: () => resolve(req, name),
  }))
}

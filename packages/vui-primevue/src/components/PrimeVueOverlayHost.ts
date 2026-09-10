import { defineComponent, h, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { usePrimeVue } from 'primevue/config'
import { dialogAllowDraggingOf, dialogButtonColorRole, dialogCloseOnEscapeOf, dialogCloseOnOverlayOf, dialogEnableResizeOf, dialogFooterKind, dialogHeaderKind, dialogMaximizableOf, dialogModalOf, dialogShowCloseIconOf, isDialogPrimaryButton, resolveDialogButtons, type UiDialogAction } from '@mmda/core'
import { UI_APP_KEY, type MmdaVueApp } from '@mmda/vui'
import {
  closeOverlayDialog,
  type PrimeOverlay,
} from '../prime_overlay'

const DEFAULT_LABELS: Record<UiDialogAction, string> = {
  ok: 'OK',
  cancel: 'Cancel',
  yes: 'Yes',
  no: 'No',
  abort: 'Abort',
  retry: 'Retry',
  ignore: 'Ignore',
}

function primeClassForRole(role?: string, primary = false): string {
  const classes = ['p-button']
  if (!primary && role !== 'primary') classes.push('p-button-text')
  if (role === 'danger') classes.push('p-button-danger')
  if (role === 'success') classes.push('p-button-success')
  if (role === 'warning') classes.push('p-button-warning')
  if (role === 'info') classes.push('p-button-info')
  return classes.join(' ')
}

export const PrimeVueOverlayHost = defineComponent({
  name: 'PrimeVueOverlayHost',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaVueApp | undefined
    const overlay = app?.ui.overlay as PrimeOverlay | undefined

    try {
      if (overlay) overlay.services.toast = useToast()
    } catch {
      /* ToastService not installed (unit tests) */
    }
    try {
      if (overlay) overlay.services.confirm = useConfirm()
    } catch {
      /* ConfirmationService not installed */
    }

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    let primeLocale: Record<string, string> | undefined
    try {
      primeLocale = usePrimeVue().config.locale as unknown as
        | Record<string, string>
        | undefined
    } catch {
      primeLocale = undefined
    }

    const labelOf = (button: UiDialogAction) => {
      const key = `dialog.${button}`
      const translated = translate?.(key)
      if (translated && translated !== key) return translated
      if (button === 'ok' && primeLocale?.accept) return primeLocale.accept
      if (button === 'cancel' && primeLocale?.cancel) return primeLocale.cancel
      return DEFAULT_LABELS[button]
    }

    return () => {
      const dialogs = overlay?.dialogs ?? []
      return h('div', { class: 'mmda-prime-overlays' }, [
        h(Toast),
        h(ConfirmDialog),
        ...dialogs.map(request => {
          const height =
            typeof request.props.height === 'number'
              ? `${request.props.height}px`
              : request.props.height
          const maxHeight =
            typeof request.props.maxHeight === 'number'
              ? `${request.props.maxHeight}px`
              : request.props.maxHeight ?? '90vh'
          const headerKind = dialogHeaderKind(request.props)
          const footerKind = dialogFooterKind(request.props)
          const props = request.props
          const minHeight =
            typeof props.minHeight === 'number'
              ? `${props.minHeight}px`
              : props.minHeight
          const dialogProps = {
            visible: true,
            modal: dialogModalOf(props),
            header: headerKind === 'title' ? props.title : undefined,
            style: {
              width:
                typeof props.width === 'number'
                  ? `${props.width}px`
                  : props.width ?? 'min(90vw, 60rem)',
              ...(height ? { height } : {}),
              maxHeight,
              ...(minHeight ? { minHeight } : {}),
            },
            pt: {
              root: {
                class: 'mmda-prime-dialog',
              },
              content: { class: 'mmda-prime-dialog__body' },
            },
            closable: dialogShowCloseIconOf(props),
            closeOnEscape: dialogCloseOnEscapeOf(props),
            dismissableMask: dialogCloseOnOverlayOf(props),
            draggable: dialogAllowDraggingOf(props),
            resizable: dialogEnableResizeOf(props),
            maximizable: dialogMaximizableOf(props),
            onShow: () => props.onOpen?.(),
            onHide: () => closeOverlayDialog(overlay!, request, 'cancel'),
            'onUpdate:visible': (visible: boolean) => {
              if (!visible) void closeOverlayDialog(overlay!, request, 'cancel')
            },
          }
          const standard = resolveDialogButtons(request.props.buttons)
          const custom = request.props.customActions ?? []
          const slots: Record<string, unknown> = {
            default: () => request.content,
          }
          if (headerKind === 'slot') {
            slots.header = () => request.props.header!()
          }
          if (footerKind === 'slot') {
            slots.footer = () => request.props.footer!()
          } else if (footerKind === 'buttons') {
            slots.footer = () =>
              h(
                'div',
                {
                  class: 'mmda-prime-dialog__footer',
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    width: '100%',
                  },
                },
                [
                  h(
                    'div',
                    { class: 'mmda-prime-dialog__footer-start' },
                    custom.map(action =>
                      h(
                        'button',
                        {
                          type: 'button',
                          class: primeClassForRole(action.colorRole),
                          onClick: () =>
                            void action.onAction?.(request.context as any),
                        },
                        action.label ?? action.name ?? '',
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { class: 'mmda-prime-dialog__footer-end' },
                    standard.map(button => {
                      const role = dialogButtonColorRole(button)
                      return h(
                        'button',
                        {
                          type: 'button',
                          class: primeClassForRole(
                            role,
                            isDialogPrimaryButton(button),
                          ),
                          onClick: () =>
                            void closeOverlayDialog(
                              overlay!,
                              request,
                              button,
                            ),
                        },
                        labelOf(button),
                      )
                    }),
                  ),
                ],
              )
          }
          return h(Dialog, { key: request.id, ...dialogProps }, slots)
        }),
      ])
    }
  },
})

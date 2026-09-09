import { defineComponent, h, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ToastComponent } from '@syncfusion/ej2-vue-notifications'
import { DialogComponent } from '@syncfusion/ej2-vue-popups'
import {
  dialogButtonColorRole,
  dialogFooterKind,
  dialogHeaderKind,
  isDialogPrimaryButton,
  resolveDialogButtons,
  type UiDialogButton,
} from '@mmda/core'
import { UI_APP_KEY, type MmdaVueApp } from '@mmda/vui'
import {
  closeOverlayDialog,
  type SyncfusionOverlay,
} from '../syncfusion_overlay'
import { dialogHeaderHtml } from '../factory/utils'

const DEFAULT_LABELS: Record<UiDialogButton, string> = {
  ok: 'OK',
  cancel: 'Cancel',
  yes: 'Yes',
  no: 'No',
  abort: 'Abort',
  retry: 'Retry',
  ignore: 'Ignore',
}

function sfCssForRole(role?: string): string | undefined {
  if (role === 'primary') return 'e-primary'
  if (role === 'danger') return 'e-danger'
  if (role === 'success') return 'e-success'
  if (role === 'warning') return 'e-warning'
  if (role === 'info') return 'e-info'
  return undefined
}

export const SfOverlayHost = defineComponent({
  name: 'SfOverlayHost',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaVueApp | undefined
    const overlay = (app?.ui as any)?.overlay as SyncfusionOverlay | undefined
    const toastRef = ref<any>()

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    const labelOf = (button: UiDialogButton) => {
      const key = `dialog.${button}`
      const translated = translate?.(key)
      if (translated && translated !== key) return translated
      return DEFAULT_LABELS[button]
    }

    return () => {
      const dialogs = overlay?.dialogs ?? []
      return h('div', { class: 'mmda-sf-overlays' }, [
        h(ToastComponent as any, {
          ref: (el: any) => {
            toastRef.value = el
            const toast = el?.ej2Instances ?? el
            if (overlay && typeof toast?.show === 'function') {
              overlay.services.toast = toast
            }
          },
        }),
        ...dialogs.map(request => {
          const height =
            typeof request.props.height === 'number'
              ? `${request.props.height}px`
              : request.props.height
          const title = request.props.title ?? ''
          const headerKind = dialogHeaderKind(request.props)
          const footerKind = dialogFooterKind(request.props)
          const maxHeight =
            typeof request.props.maxHeight === 'number'
              ? `${request.props.maxHeight}px`
              : request.props.maxHeight
          const dialogProps: Record<string, unknown> = {
            visible: true,
            isModal: request.props.modal ?? true,
            width:
              typeof request.props.width === 'number'
                ? `${request.props.width}px`
                : request.props.width ?? 'min(90vw, 60rem)',
            allowDragging: true,
            enableResize: true,
            showCloseIcon: true,
            closeOnEscape: true,
            cssClass: 'mmda-sf-dialog',
            close: () => void closeOverlayDialog(overlay!, request, 'cancel'),
            open: (args: { element?: HTMLElement }) => {
              const el = args?.element
              if (el && maxHeight) el.style.maxHeight = maxHeight
              const headerEl = el?.querySelector?.('.e-dlg-header')
              if (
                headerKind === 'title' &&
                headerEl &&
                title &&
                !headerEl.textContent?.trim()
              ) {
                headerEl.textContent = title
              }
              request.props.onOpen?.()
            },
          }
          if (headerKind === 'title') {
            dialogProps.header = dialogHeaderHtml(title)
          }
          if (height) dialogProps.height = height

          const standard = resolveDialogButtons(request.props.buttons)
          const custom = request.props.customActions ?? []

          const footer =
            footerKind === 'slot'
              ? () => request.props.footer!()
              : footerKind === 'buttons'
                ? () =>
                    h(
                      'div',
                      {
                        class: 'mmda-sf-dialog__footer',
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
                          { class: 'mmda-sf-dialog__footer-start' },
                          custom.map(action =>
                            h(
                              'button',
                              {
                                type: 'button',
                                class: [
                                  'e-btn',
                                  'e-flat',
                                  sfCssForRole(action.colorRole),
                                ]
                                  .filter(Boolean)
                                  .join(' '),
                                onClick: () =>
                                  void action.onAction?.(
                                    request.context as any,
                                  ),
                              },
                              action.label ?? action.name ?? '',
                            ),
                          ),
                        ),
                        h(
                          'div',
                          { class: 'mmda-sf-dialog__footer-end' },
                          standard.map(button => {
                            const role = dialogButtonColorRole(button)
                            return h(
                              'button',
                              {
                                type: 'button',
                                class: [
                                  'e-btn',
                                  isDialogPrimaryButton(button)
                                    ? 'e-primary'
                                    : 'e-flat',
                                  sfCssForRole(role),
                                ]
                                  .filter(Boolean)
                                  .join(' '),
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
                : undefined

          return h(
            DialogComponent as any,
            { key: request.id, ...dialogProps },
            {
              default: () =>
                h('div', { class: 'mmda-sf-dialog__body' }, [request.content]),
              ...(headerKind === 'slot'
                ? { headerTemplate: () => request.props.header!() }
                : {}),
              ...(footer ? { footerTemplate: footer } : {}),
            },
          )
        }),
      ])
    }
  },
})

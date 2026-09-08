import { computed, defineComponent, h, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ToastComponent } from '@syncfusion/ej2-vue-notifications'
import { DialogComponent } from '@syncfusion/ej2-vue-popups'
import { UI_APP_KEY, type MmdaVueApp } from '@mmda/vui'
import {
  closeOverlayDialog,
  type SyncfusionOverlay,
} from '../syncfusion_overlay'
import { dialogHeaderHtml } from '../factory/utils'

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

    const cancelLabel = computed(() => translate?.('dialog.cancel') || 'Cancel')
    const okLabel = computed(() => translate?.('dialog.ok') || 'OK')

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
          const dialogProps: Record<string, unknown> = {
            visible: true,
            header: dialogHeaderHtml(title),
            isModal: request.props.modal ?? true,
            width:
              typeof request.props.width === 'number'
                ? `${request.props.width}px`
                : request.props.width ?? 'min(90vw, 60rem)',
            allowDragging: true,
            enableResize: true,
            showCloseIcon: true,
            closeOnEscape: true,
            cssClass: ['mmda-sf-dialog', request.props.cssClass]
              .filter(Boolean)
              .join(' '),
            close: () => void closeOverlayDialog(overlay!, request, false),
            open: (args: { element?: HTMLElement }) => {
              const headerEl = args?.element?.querySelector?.('.e-dlg-header')
              if (headerEl && title && !headerEl.textContent?.trim()) {
                headerEl.textContent = title
              }
            },
          }
          if (height) dialogProps.height = height
          if (request.props.showFooter !== false) {
            dialogProps.buttons = [
              {
                click: () =>
                  void closeOverlayDialog(overlay!, request, false),
                buttonModel: {
                  content: cancelLabel.value,
                  cssClass: 'e-flat',
                },
              },
              {
                click: () =>
                  void closeOverlayDialog(overlay!, request, true),
                buttonModel: {
                  content: okLabel.value,
                  isPrimary: true,
                },
              },
            ]
          }
          return h(
            DialogComponent as any,
            { key: request.id, ...dialogProps },
            {
              default: () =>
                h('div', { class: 'mmda-sf-dialog__body' }, [request.content]),
            },
          )
        }),
      ])
    }
  },
})

import { computed, defineComponent, h, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ToastComponent } from '@syncfusion/ej2-vue-notifications'
import { UI_APP_KEY, type MmdaApplication } from '@mmda/vui'
import {
  closeOverlayDialog,
  type SyncfusionOverlay,
} from '../syncfusion_overlay'

export const SyncfusionOverlayHost = defineComponent({
  name: 'SyncfusionOverlayHost',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaApplication | undefined
    const overlay = (app?.ui as any)?.overlay as SyncfusionOverlay | undefined
    const toastRef = ref<any>()

    if (overlay) overlay.services.factory = app?.ui.factory

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    const cancelLabel = computed(() => translate?.('dialog.cancel') || 'Cancel')
    const okLabel = computed(() => translate?.('dialog.ok') || 'OK')

    return () => {
      const factory = overlay?.services.factory
      const dialogs = overlay?.dialogs ?? []
      return h('div', { class: 'mmda-sf-overlays' }, [
        h(ToastComponent as any, {
          ref: (el: any) => {
            toastRef.value = el
            if (overlay && el?.show) overlay.services.toast = el
          },
        }),
        ...dialogs.map(request => {
          const height =
            typeof request.props.height === 'number'
              ? `${request.props.height}px`
              : request.props.height
          const title =
            request.props.title ??
            request.props.header ??
            request.props.name
          const dialogProps: Record<string, unknown> = {
            visible: true,
            header: title,
            modal: request.props.modal,
            width:
              typeof request.props.width === 'number'
                ? `${request.props.width}px`
                : request.props.width ?? 'min(90vw, 60rem)',
            allowDragging: request.props.allowDragging ?? true,
            enableResize: request.props.enableResize ?? true,
            showCloseIcon: request.props.showCloseIcon ?? true,
            closeOnEscape: request.props.closeOnEscape ?? true,
            cssClass: ['mmda-sf-dialog', request.props.cssClass]
              .filter(Boolean)
              .join(' '),
            onUpdateVisible: (visible: boolean) => {
              if (!visible) void closeOverlayDialog(overlay!, request, false)
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
          const slots = {
            default: () =>
              h('div', { class: 'mmda-sf-dialog__body' }, [request.content]),
          }
          return factory?.dialog(dialogProps, slots)
        }),
      ])
    }
  },
})

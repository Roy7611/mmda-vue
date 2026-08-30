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
          const dialogProps = {
            visible: true,
            header: request.props.title ?? request.props.name,
            width:
              typeof request.props.width === 'number'
                ? `${request.props.width}px`
                : request.props.width ?? 'min(90vw, 60rem)',
            onUpdateVisible: (visible: boolean) => {
              if (!visible) void closeOverlayDialog(overlay!, request, false)
            },
          }
          const slots = {
            default: () => request.content,
            footer: () =>
              h('div', { class: 'mmda-sf-dialog__footer' }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'e-btn e-flat',
                    onClick: () => closeOverlayDialog(overlay!, request, false),
                  },
                  cancelLabel.value,
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'e-btn e-primary',
                    onClick: () => closeOverlayDialog(overlay!, request, true),
                  },
                  okLabel.value,
                ),
              ]),
          }
          return factory?.dialog(dialogProps, slots)
        }),
      ])
    }
  },
})

import {
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  ref,
  type PropType,
  type VNode,
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NButton,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NModal,
  NNotificationProvider,
  useDialog,
  useMessage,
} from 'naive-ui'
import {
  dialogAllowDraggingOf,
  dialogButtonColorRole,
  dialogButtonLabel,
  dialogCloseOnEscapeOf,
  dialogCloseOnOverlayOf,
  dialogEnableResizeOf,
  dialogFooterKind,
  dialogHeaderKind,
  dialogShowCloseIconOf,
  isDialogPrimaryButton,
  resolveDialogButtons,
  uiCssClass,
  type UiDialogAction,
} from '@mmda/core'
import { UI_APP_KEY, type MmdaVueApp } from '@mmda/vui'
import {
  closeOverlayDialog,
  type AgNaiveVuiOverlay,
  type AgNaiveVuiDialogRequest,
} from '../agnaive_overlay'
import {
  naiveLocaleOf,
  naiveOverridesRef,
  naiveSkinState,
  naiveThemeRef,
} from '../agnaive_theme'
import {
  attachDialogResize,
  detachDialogResize,
  findTopNaiveDialog,
} from '../dialog_resize'

/** Dialog shell size: number → px string. */
export function cssSizeOf(
  value: string | number | undefined | null,
): string | undefined {
  if (value == null || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : String(value)
}

/** NModal style for width / height / minHeight / maxHeight. */
export function dialogShellStyleOf(opts: {
  width: string
  height?: string
  minHeight?: string
  maxHeight?: string
}): Record<string, string> {
  const style: Record<string, string> = { width: opts.width }
  if (opts.height) style.height = opts.height
  if (opts.minHeight) style.minHeight = opts.minHeight
  if (opts.maxHeight) style.maxHeight = opts.maxHeight
  return style
}

function naiveTypeForRole(
  role?: string,
  primary = false,
): 'default' | 'primary' | 'error' | 'success' | 'warning' | 'info' {
  if (role === 'danger') return 'error'
  if (role === 'success') return 'success'
  if (role === 'warning') return 'warning'
  if (role === 'info') return 'info'
  if (role === 'primary' || primary) return 'primary'
  return 'default'
}

/**
 * Naive 把 startDrag 挂在 Transition onAfterEnter。
 * 父级一上来 show=true 时 enter 常不跑，标题拖不动。
 * 这里 false→true 打开，走官方 NModal/DialogOptions.draggable。
 * @see https://www.naiveui.com/zh-CN/os-theme/components/dialog#DialogOptions-Properties
 */
const AgNaiveVuiDialogModal = defineComponent({
  name: 'AgNaiveVuiDialogModal',
  props: {
    request: { type: Object as PropType<AgNaiveVuiDialogRequest>, required: true },
    width: { type: String, required: true },
    height: { type: String, default: undefined },
    minHeight: { type: String, default: undefined },
    maxHeight: { type: String, default: undefined },
    headerKind: {
      type: String as PropType<'title' | 'slot'>,
      required: true,
    },
    canDrag: { type: Boolean, required: true },
    canResize: { type: Boolean, required: true },
    overlay: { type: Object as PropType<AgNaiveVuiOverlay>, required: true },
  },
  setup(props, { slots }) {
    const show = ref(false)
    const resizeEl = ref<HTMLElement | null>(null)

    onMounted(() => {
      void nextTick(() => {
        show.value = true
      })
    })

    return () => {
      const request = props.request
      const dlgProps = request.props
      return h(
        NModal,
        {
          show: show.value,
          preset: 'dialog',
          title: props.headerKind === 'title' ? dlgProps.title : undefined,
          showIcon: false,
          style: dialogShellStyleOf({
            width: props.width,
            height: props.height,
            minHeight: props.minHeight,
            maxHeight: props.maxHeight,
          }),
          class: [
            uiCssClass('dialog'),
            props.canResize
              ? uiCssClass('dialog', undefined, 'resizable')
              : null,
          ],
          draggable: props.canDrag ? { bounds: 'none' } : false,
          closable: dialogShowCloseIconOf(dlgProps),
          closeOnEsc: dialogCloseOnEscapeOf(dlgProps),
          maskClosable: dialogCloseOnOverlayOf(dlgProps),
          onAfterEnter: () => {
            dlgProps.onOpen?.()
            if (!props.canResize) return
            requestAnimationFrame(() => {
              const el = findTopNaiveDialog()
              if (!el) return
              attachDialogResize(el)
              resizeEl.value = el
            })
          },
          onAfterLeave: () => {
            detachDialogResize(resizeEl.value)
            resizeEl.value = null
          },
          'onUpdate:show': (next: boolean) => {
            show.value = next
            if (!next) {
              void closeOverlayDialog(props.overlay, request, 'cancel')
            }
          },
        },
        slots,
      )
    }
  },
})

const OverlayInner = defineComponent({
  name: 'AgNaiveOverlayInner',
  setup() {
    const app = inject(UI_APP_KEY) as MmdaVueApp | undefined
    const overlay = app?.ui.overlay as AgNaiveVuiOverlay | undefined
    const message = useMessage()
    const dialog = useDialog()

    if (overlay) {
      overlay.services.toast = toastProps => {
        const text = String(toastProps.message ?? toastProps.title ?? '')
        const type = toastProps.severity ?? 'info'
        if (type === 'error') message.error(text)
        else if (type === 'warning') message.warning(text)
        else if (type === 'success') message.success(text)
        else message.info(text)
      }
      overlay.services.confirm = confirmProps =>
        new Promise(resolve => {
          dialog.warning({
            title: String(confirmProps.title ?? ''),
            content: String(confirmProps.message ?? ''),
            positiveText: 'OK',
            negativeText: 'Cancel',
            draggable: true,
            onPositiveClick: () => resolve(true),
            onNegativeClick: () => resolve(false),
          })
        })
    }

    let translate: ((key: string) => string) | undefined
    try {
      translate = useI18n({ useScope: 'global' }).t
    } catch {
      translate = undefined
    }

    const labelOf = (button: UiDialogAction) => {
      const key = `dialog.${button}`
      const translated = translate?.(key)
      if (translated && translated !== key) return translated
      return dialogButtonLabel(button)
    }

    return () => {
      const dialogs = overlay?.dialogs ?? []
      return h(
        'div',
        { class: uiCssClass('overlays') },
        dialogs.map(request => {
          const width =
            typeof request.props.width === 'number'
              ? `${request.props.width}px`
              : request.props.width ?? 'min(90vw, 60rem)'
          const headerKind = dialogHeaderKind(request.props)
          const footerKind = dialogFooterKind(request.props)
          const standard = resolveDialogButtons(request.props.buttons)
          const custom = request.props.customActions ?? []
          const slots: Record<string, () => VNode | VNode[] | string | null> = {
            default: () => request.content,
          }
          if (headerKind === 'slot') {
            slots.header = () => request.props.header!() as VNode
          }
          if (footerKind === 'slot') {
            slots.action = () => request.props.footer!() as VNode
          } else if (footerKind === 'buttons') {
            slots.action = () =>
              h(
                'div',
                {
                  class: uiCssClass('dialog', 'footer'),
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
                    { class: uiCssClass('dialog', 'footer-start') },
                    custom.map(action =>
                      h(
                        NButton,
                        {
                          type: naiveTypeForRole(action.colorRole),
                          onClick: () =>
                            void action.onAction?.(request.context as any),
                        },
                        {
                          default: () => action.label ?? action.name ?? '',
                        },
                      ),
                    ),
                  ),
                  h(
                    'div',
                    { class: uiCssClass('dialog', 'footer-end') },
                    standard.map(button => {
                      const role = dialogButtonColorRole(button)
                      return h(
                        NButton,
                        {
                          type: naiveTypeForRole(
                            role,
                            isDialogPrimaryButton(button),
                          ),
                          onClick: () =>
                            void closeOverlayDialog(overlay!, request, button),
                        },
                        { default: () => labelOf(button) },
                      )
                    }),
                  ),
                ],
              )
          }
          const dlgProps = request.props
          const minHeight = cssSizeOf(dlgProps.minHeight)
          const height = cssSizeOf(dlgProps.height)
          const maxHeight = cssSizeOf(dlgProps.maxHeight)
          return h(
            AgNaiveVuiDialogModal,
            {
              key: request.id,
              request,
              width,
              height,
              minHeight,
              maxHeight,
              headerKind,
              canDrag: dialogAllowDraggingOf(dlgProps),
              canResize: dialogEnableResizeOf(dlgProps),
              overlay: overlay!,
            },
            slots,
          )
        }),
      )
    }
  },
})

export const AgNaiveVuiOverlayHost = defineComponent({
  name: 'AgNaiveVuiOverlayHost',
  setup() {
    return () => {
      const loc = naiveLocaleOf(naiveSkinState.locale)
      return h(
        NConfigProvider,
        {
          theme: naiveThemeRef.value,
          themeOverrides: naiveOverridesRef.value,
          locale: loc.locale,
          dateLocale: loc.dateLocale,
        },
        {
          default: () =>
            h(NMessageProvider, null, {
              default: () =>
                h(NDialogProvider, null, {
                  default: () =>
                    h(NNotificationProvider, null, {
                      default: () => h(OverlayInner),
                    }),
                }),
            }),
        },
      )
    }
  },
})

import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  Teleport,
  type PropType,
  type VNode,
} from 'vue'
import type { UiAction, UiDropDownButtonProps, UiSlots } from '@mmda/vui'
import { createIconVNode } from '@mmda/vui'
import { createButton } from '../factory/button'

export type DropupPlacement = 'top' | 'top-end'

/**
 * 自研向上弹出菜单（Dropup）。
 * 侧栏 footer 在 overflow:hidden 容器内，Naive NDropdown 会被夹住/错位，
 * 这里用 Button + Teleport + fixed，与 Syncfusion SfDropupMenuButton 同策略。
 */
export const NDropupMenuButton = defineComponent({
  name: 'NDropupMenuButton',
  props: {
    buttonProps: {
      type: Object as PropType<UiDropDownButtonProps>,
      required: true,
    },
    actions: {
      type: Array as PropType<UiAction[]>,
      default: () => [],
    },
    slots: {
      type: Object as PropType<UiSlots>,
      default: undefined,
    },
    placement: {
      type: String as PropType<DropupPlacement>,
      default: 'top-end',
    },
  },
  setup(props) {
    const open = ref(false)
    const rootEl = ref<HTMLElement | null>(null)
    const menuEl = ref<HTMLElement | null>(null)
    const style = ref<Record<string, string>>({
      top: '0px',
      left: '0px',
      visibility: 'hidden',
    })

    const getTrigger = (): HTMLElement | null => {
      const root = rootEl.value
      if (!root) return null
      return (
        (root.querySelector('button, .n-button') as HTMLElement | null) ?? root
      )
    }

    const getAnchor = (btn: HTMLElement): HTMLElement =>
      (btn.closest('.mmda-sidebar__footer') as HTMLElement | null) ||
      (btn.closest('.mmda-user-footer') as HTMLElement | null) ||
      btn

    const getPanel = (btn: HTMLElement, anchor: HTMLElement): HTMLElement => {
      const chrome = btn.closest(
        '.mmda-app-side-menu__chrome',
      ) as HTMLElement | null
      return (
        (chrome?.querySelector(
          '.mmda-app-side-menu__modules',
        ) as HTMLElement | null) ||
        (anchor.closest('#mmda-app-sidebar') as HTMLElement | null) ||
        (btn.closest('.mmda-aside') as HTMLElement | null) ||
        anchor
      )
    }

    const placeMenu = () => {
      const btn = getTrigger()
      const menu = menuEl.value
      if (!btn || !menu) return

      const pad = 8
      const btnRect = btn.getBoundingClientRect()
      const anchor = getAnchor(btn)
      const panel = getPanel(btn, anchor)
      const anchorRect = anchor.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const height = menu.offsetHeight
      const width = menu.offsetWidth

      const top = Math.max(pad, anchorRect.top - height - 4)
      let left =
        props.placement === 'top' ? btnRect.left : btnRect.right - width
      const maxRight = panelRect.right - pad
      const minLeft = panelRect.left + pad
      if (left + width > maxRight) left = maxRight - width
      if (left < minLeft) left = minLeft

      style.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        maxWidth: `${Math.max(120, panelRect.width - pad * 2)}px`,
        zIndex: '1400',
        visibility: 'visible',
      }
    }

    const close = () => {
      open.value = false
      style.value = { ...style.value, visibility: 'hidden' }
    }

    const toggle = async (event?: Event) => {
      event?.preventDefault()
      event?.stopPropagation()
      if (open.value) {
        close()
        return
      }
      open.value = true
      style.value = {
        position: 'fixed',
        top: '0px',
        left: '0px',
        visibility: 'hidden',
        zIndex: '1400',
      }
      await nextTick()
      requestAnimationFrame(() => {
        placeMenu()
        requestAnimationFrame(placeMenu)
      })
    }

    const onDocPointer = (event: Event) => {
      if (!open.value) return
      const target = event.target as Node | null
      if (!target) return
      if (rootEl.value?.contains(target)) return
      if (menuEl.value?.contains(target)) return
      close()
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open.value) close()
    }

    if (typeof document !== 'undefined') {
      onMounted(() => {
        document.addEventListener('mousedown', onDocPointer, true)
        document.addEventListener('touchstart', onDocPointer, true)
        document.addEventListener('keydown', onKey, true)
      })
      onBeforeUnmount(() => {
        document.removeEventListener('mousedown', onDocPointer, true)
        document.removeEventListener('touchstart', onDocPointer, true)
        document.removeEventListener('keydown', onKey, true)
      })
    }

    const runItem = (action: UiAction) => {
      if (action.disabled || action.divider) return
      close()
      action.onAction?.()
    }

    const renderItems = (): VNode[] => {
      const nodes: VNode[] = []
      for (const action of props.actions) {
        if (action.divider) {
          nodes.push(
            h('li', { class: 'mmda-dropup__separator', role: 'separator' }),
          )
          continue
        }
        nodes.push(
          h(
            'li',
            {
              class: [
                'mmda-dropup__item',
                action.disabled ? 'is-disabled' : '',
              ]
                .filter(Boolean)
                .join(' '),
              role: 'menuitem',
              tabindex: action.disabled ? -1 : 0,
              onClick: (e: MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                runItem(action)
              },
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  runItem(action)
                }
              },
            },
            [
              action.icon
                ? createIconVNode(String(action.icon), {
                    class: 'mmda-dropup__icon',
                    'aria-hidden': true,
                  })
                : null,
              h(
                'span',
                { class: 'mmda-dropup__label' },
                action.label ?? action.name ?? '',
              ),
            ],
          ),
        )
      }
      return nodes
    }

    return () => {
      const bp = props.buttonProps
      const hideCaret =
        bp.hideCaret === true ||
        bp.shape === 'circle' ||
        (!bp.label && Boolean(bp.icon))

      return h(
        'span',
        {
          class: 'mmda-dropup-host',
          ref: (el: any) => {
            rootEl.value = (el as HTMLElement) ?? null
          },
        },
        [
          createButton(
            {
              ...bp,
              label: hideCaret ? undefined : bp.label,
              shape: hideCaret ? 'circle' : bp.shape,
              buttonType: bp.buttonType ?? (hideCaret ? 'text' : undefined),
              colorRole:
                bp.colorRole ??
                (bp.buttonType === 'tonal' ? 'secondary' : undefined),
              class: [
                bp.class,
                hideCaret ? 'mmda-menu-button--icon-only' : '',
                open.value ? 'is-active' : '',
              ]
                .flat()
                .filter(Boolean)
                .join(' '),
              onClick: (e: Event) => {
                toggle(e)
                const userClick = (bp as any).onClick
                if (typeof userClick === 'function') userClick(e)
              },
            },
            props.slots as any,
          ),
          open.value
            ? h(Teleport, { to: 'body' }, [
                h(
                  'div',
                  {
                    class: 'mmda-dropup',
                    role: 'menu',
                    ref: (el: any) => {
                      menuEl.value = (el as HTMLElement) ?? null
                    },
                    style: style.value,
                    onMousedown: (e: Event) => e.stopPropagation(),
                  },
                  [h('ul', { class: 'mmda-dropup__list' }, renderItems())],
                ),
              ])
            : null,
        ],
      )
    }
  },
})

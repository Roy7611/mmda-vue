import { h } from 'vue'
import { NDropdown } from 'naive-ui'
import type { UiAction, UiDropDownButtonProps, VuiTileSlots } from '@mmda/vui'
import { createIconVNode } from '@mmda/vui'
import { NaiveDropupMenuButton } from '../components/NaiveDropupMenuButton'
import { createButton } from './button'

const dropdownOptions = (actions: UiAction[]): unknown[] =>
  actions.map((action) => {
    if (action.divider)
      return { type: 'divider' as const, key: `div-${action.name}` }
    return {
      label: action.label ?? action.name,
      key: String(action.name ?? action.label),
      disabled: action.disabled === true,
      icon: action.icon
        ? () => createIconVNode(action.icon as string)
        : undefined,
      children: action.items?.length
        ? dropdownOptions(action.items)
        : undefined,
    }
  })

const findAction = (actions: UiAction[], key: string): UiAction | undefined => {
  for (const action of actions) {
    if ((action.name ?? action.label) === key) return action
    if (action.items?.length) {
      const nested = findAction(action.items, key)
      if (nested) return nested
    }
  }
  return undefined
}

/** Map MMDA popupPlacement → Naive Dropdown/Popover placement. */
function naivePlacementOf(
  placement: UiDropDownButtonProps['popupPlacement'],
): 'bottom' | 'bottom-end' | 'top' | 'top-end' {
  if (placement === 'top' || placement === 'top-end') return placement
  if (placement === 'bottom-end') return 'bottom-end'
  return 'bottom'
}

function opensUpward(
  placement: UiDropDownButtonProps['popupPlacement'],
): boolean {
  return placement === 'top' || placement === 'top-end'
}

export function createDropDownButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: VuiTileSlots,
  button: typeof createButton = createButton,
) {
  // 侧栏 footer 在 overflow:hidden 内：向上开用自研 Dropup（Teleport + fixed）
  if (opensUpward(props.popupPlacement)) {
    return h(NaiveDropupMenuButton as any, {
      buttonProps: props,
      actions,
      slots,
      placement: props.popupPlacement === 'top' ? 'top' : 'top-end',
    })
  }

  const hideCaret =
    props.hideCaret === true ||
    props.shape === 'circle' ||
    (!props.label && Boolean(props.icon))
  const placement = naivePlacementOf(props.popupPlacement)
  return h(
    NDropdown as any,
    {
      trigger: 'click',
      placement,
      to: 'body',
      options: dropdownOptions(actions),
      onSelect: (key: string) => {
        const action = findAction(actions, key)
        action?.onAction?.()
      },
    },
    {
      default: () =>
        button(
          {
            ...props,
            label: hideCaret ? undefined : props.label,
            shape: hideCaret ? 'circle' : props.shape,
            buttonType: props.buttonType ?? (hideCaret ? 'text' : undefined),
            colorRole:
              props.colorRole ??
              (props.buttonType === 'tonal' ? 'secondary' : undefined),
            class: [
              props.class,
              hideCaret ? 'mmda-menu-button--icon-only' : '',
            ]
              .flat()
              .filter(Boolean)
              .join(' '),
          },
          slots as any,
        ),
    },
  )
}

export function createMoreMenuButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: VuiTileSlots,
  button: typeof createButton = createButton,
) {
  return createDropDownButton(
    {
      ...props,
      class: ['mmda-more-menu-button', props.class],
    },
    actions,
    slots,
    button,
  )
}

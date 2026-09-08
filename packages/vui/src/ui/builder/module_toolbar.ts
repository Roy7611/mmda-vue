import { h, type VNode, type VNodeChild } from 'vue'
import type { ModuleToolbarProps } from '../../app/app'
import type { UiAction } from '../factory/action'
import type { UiFactory } from '../factory/factory'
import type { UiToolbarLayout } from '../factory/toolbar'
import type { UiSlots } from '../layout/layout'
import type { UiActionFactory } from './actions'

export function defaultToolbarMoreActions(
  actionFactory: UiActionFactory,
  context: any,
): UiAction[] {
  if (context?.editing) {
    return [actionFactory.save(context), actionFactory.cancel(context)]
  }
  if (context?.many) {
    return [actionFactory.create(context)]
  }
  return [actionFactory.back(context), actionFactory.edit(context)]
}

export function moduleToolbarLayoutOf(
  props: ModuleToolbarProps = {},
): UiToolbarLayout {
  const layout = props.layout
  if (layout === 'medium' || layout === 'compact') return layout
  return 'full'
}

export function paintModuleToolbar(
  factory: UiFactory,
  context: { title?: string; t: (message: string) => string },
  props: ModuleToolbarProps,
  slots: UiSlots | undefined,
  parts: {
    className?: unknown
    breadcrumb: () => VNodeChild
    actionGroup: () => VNodeChild
    moreActions: () => UiAction[]
    navActions: () => UiAction[]
    openSearchPage: () => void
  },
): VNode {
  const layout = moduleToolbarLayoutOf(props)
  const showBreadcrumb = props.showBreadcrumb !== false
  const showActions = props.showActions !== false
  const showSearchBar = props.showSearchBar !== false
  const t = (key: string) => context.t(key)
  const searchCenter =
    showSearchBar && slots?.center ? () => slots.center!() : undefined

  const startFull = () => {
    if (!showBreadcrumb) return undefined
    if (slots?.default) return slots.default()
    return parts.breadcrumb()
  }

  const moreMenu = () =>
    factory.moreMenuButton(
      {
        label: t('action.more'),
        tooltip: t('action.more'),
        buttonType: 'tonal',
        colorRole: 'secondary',
      },
      parts.moreActions(),
    )

  const compactMenu = () =>
    factory.dropDownButton(
      {
        icon: factory.resolveIcon('more'),
        tooltip: t('action.more'),
        buttonType: 'text',
        hideCaret: true,
      },
      [...parts.navActions(), ...parts.moreActions()],
    )

  const magnifier = () =>
    factory.button({
      icon: factory.resolveIcon('search'),
      tooltip: t('action.search'),
      buttonType: 'text',
      onClick: () => parts.openSearchPage(),
    })

  let start: (() => VNodeChild) | undefined
  let center: (() => VNodeChild) | undefined
  let end: (() => VNodeChild) | undefined

  if (layout === 'compact') {
    start = showBreadcrumb || showActions ? compactMenu : undefined
    center = () => h('strong', context.title ?? '')
    end = showSearchBar ? magnifier : undefined
  } else if (layout === 'medium') {
    start = startFull
    center = searchCenter
    end = showActions ? moreMenu : undefined
  } else {
    start = startFull
    center = searchCenter
    end = showActions ? () => parts.actionGroup() : undefined
  }

  return factory.toolbar(
    { layout, class: parts.className },
    { start, center, end },
  )
}

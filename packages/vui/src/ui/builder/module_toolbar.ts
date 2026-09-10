import { uiCssClass } from '@mmda/core'
import { defineComponent, h, type VNode, type VNodeChild } from 'vue'
import type { ModuleToolbarProps } from '../../app/app'
import { useCompactViewport } from '../../composables/useCompactViewport'
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

export type ModuleToolbarPaintParts = {
  className?: unknown
  breadcrumb: () => VNodeChild
  actionGroup: (dense?: boolean) => VNodeChild
  moreActions: () => UiAction[]
  navActions: () => UiAction[]
  openSearchPage: () => void
}

type ModuleToolbarHostProps = {
  factory: UiFactory
  context: { title?: string; t: (message: string) => string }
  toolbarProps: ModuleToolbarProps
  slots?: UiSlots
  parts: ModuleToolbarPaintParts
}

function paintModuleToolbarTree(
  factory: UiFactory,
  context: { title?: string; t: (message: string) => string },
  props: ModuleToolbarProps,
  slots: UiSlots | undefined,
  parts: ModuleToolbarPaintParts,
  dense: boolean,
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
        icon: factory.resolveIcon('more'),
        label: dense ? '' : t('action.more'),
        tooltip: t('action.more'),
        'aria-label': t('action.more'),
        hideCaret: dense,
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
    end = showActions ? () => parts.actionGroup(dense) : undefined
  }

  return factory.toolbar(
    {
      layout,
      class: [
        parts.className,
        dense ? uiCssClass('toolbar', undefined, 'dense') : undefined,
      ],
    },
    { start, center, end },
  )
}

const MmdaModuleToolbarHost = defineComponent({
  name: 'MmdaModuleToolbar',
  props: {
    factory: { type: Object, required: true },
    context: { type: Object, required: true },
    toolbarProps: { type: Object, required: true },
    slots: { type: Object, default: undefined },
    parts: { type: Object, required: true },
  },
  setup(rawProps) {
    const compact = useCompactViewport()
    return () => {
      const props = rawProps as unknown as ModuleToolbarHostProps
      return paintModuleToolbarTree(
        props.factory,
        props.context,
        props.toolbarProps,
        props.slots,
        props.parts,
        compact.value,
      )
    }
  },
})

export function paintModuleToolbar(
  factory: UiFactory,
  context: { title?: string; t: (message: string) => string },
  props: ModuleToolbarProps,
  slots: UiSlots | undefined,
  parts: ModuleToolbarPaintParts,
): VNode {
  return h(MmdaModuleToolbarHost, {
    factory,
    context,
    toolbarProps: props,
    slots,
    parts,
  } as any)
}

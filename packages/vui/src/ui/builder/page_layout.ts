import type { UiPageLayout } from '@mmda/core'
import { writeStoredPageLayout } from '../../app/theme'
import type { VueUiContext } from '../../contexts/vue_ui_context'

function resolveLayout(context: VueUiContext<any>) {
  return (
    (context.uiBuilder as { layout?: { pageLayout: UiPageLayout } } | undefined)
      ?.layout ??
    (context.app?.ui as { layout?: { pageLayout: UiPageLayout } } | undefined)
      ?.layout
  )
}

function currentPageLayout(context: VueUiContext<any>): UiPageLayout {
  return resolveLayout(context)?.pageLayout === 'tabs' ? 'tabs' : 'cards'
}

/** 切换详情页壳并触发 EntityView 重绘。 */
export function applyPageLayout(
  context: VueUiContext<any>,
  next: UiPageLayout,
) {
  const layout = resolveLayout(context)
  const normalized: UiPageLayout = next === 'tabs' ? 'tabs' : 'cards'
  if (layout) {
    layout.pageLayout = normalized
  } else {
    writeStoredPageLayout(normalized)
  }
  context.pageLayoutRev.value += 1
}

/**
 * 详情「更多」菜单：分隔线 +「卡片」「页签」两项平铺切换。
 * `icon` 为逻辑名 `page-layout`，由皮肤 `factory.resolveIcon` 映射。
 * 当前布局项 `disabled`，避免重复点选。
 */
export function pageLayoutMenuItems(context: VueUiContext<any>) {
  const current = currentPageLayout(context)
  return [
    { divider: true },
    {
      name: 'pageLayoutCards',
      label: context.t('action.pageLayoutCards'),
      icon: 'page-layout',
      disabled: current === 'cards',
      onAction: () => applyPageLayout(context, 'cards'),
      command: () => applyPageLayout(context, 'cards'),
    },
    {
      name: 'pageLayoutTabs',
      label: context.t('action.pageLayoutTabs'),
      icon: 'page-layout',
      disabled: current === 'tabs',
      onAction: () => applyPageLayout(context, 'tabs'),
      command: () => applyPageLayout(context, 'tabs'),
    },
  ]
}

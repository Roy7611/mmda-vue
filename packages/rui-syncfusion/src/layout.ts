import { createElement, type ReactNode } from 'react'
import {
  uiCssClass,
  type UiAppLayoutVariant,
  type UiAppScaffoldSlots,
} from '@mmda/core'
import { RuiLayout } from '@mmda/rui'

/**
 * Syncfusion EJ2 React 壳布局。
 *
 * sidebarLeft 下 nav 与主区为 `.mmda-app-layout` 的兄弟节点，主区叠
 * `e-main-content`（EJ2 Sidebar Push），对齐 Vue 皮肤的 SfVuiLayout。
 */
export class SfRuiLayout extends RuiLayout {
  override scaffold(slots: UiAppScaffoldSlots<ReactNode>): ReactNode {
    const variant: UiAppLayoutVariant = slots.variant ?? 'sidebarLeft'
    if (variant !== 'sidebarLeft') {
      return super.scaffold(slots)
    }

    const pageClass = `${uiCssClass('app-page')} e-main-content`
    const pageBody =
      slots.topBar == null
        ? [slots.page ?? null]
        : [
            createElement(
              'header',
              { className: uiCssClass('app-topbar') },
              slots.topBar,
            ),
            slots.page ?? null,
          ]

    return createElement(
      'div',
      {
        id: 'mmda-app-layout',
        className: uiCssClass('app-layout'),
        'data-layout': variant,
      },
      slots.nav ?? null,
      createElement('div', { className: pageClass, role: 'main' }, ...pageBody),
      slots.bottomBar == null
        ? null
        : createElement(
            'footer',
            { className: uiCssClass('app-bottom') },
            slots.bottomBar,
          ),
    )
  }
}

import { h, type VNode } from 'vue'
import {
  uiCssClass,
  type UiAppLayoutVariant,
  type UiAppScaffoldSlots,
  type UiListTileSlots,
} from '@mmda/core'
import { VueUiLayout } from '@mmda/vui'

/**
 * Syncfusion 壳：sidebarLeft 下 nav 与主区须为 `.mmda-app-layout` 的兄弟节点，
 * 主区叠 `e-main-content`（EJ2 Sidebar Push）。不要再包一层 `.mmda-app-nav`，
 * 否则 Dock 挪 DOM / Pad compact 会掉出 grid，侧栏被顶到主区下面。
 */
export class SyncfusionLayout extends VueUiLayout {
  listTile(slots: UiListTileSlots<VNode>): VNode {
    return h('article', { class: 'mmda-list-tile' }, [
      slots.leading?.(),
      h('div', { class: 'mmda-list-tile__content' }, [
        slots.title(),
        slots.subtitle?.(),
      ]),
      slots.trailing?.(),
    ])
  }

  override scaffold(slots: UiAppScaffoldSlots<VNode>): VNode {
    const variant: UiAppLayoutVariant = slots.variant ?? 'sidebarLeft'
    if (variant !== 'sidebarLeft') {
      return super.scaffold(slots)
    }

    const pageClass = `${uiCssClass('app-page')} e-main-content`
    const pageBody =
      slots.topBar == null
        ? [slots.page ?? null]
        : [
            h(
              'header',
              { class: uiCssClass('app-topbar') },
              [slots.topBar],
            ),
            slots.page ?? null,
          ]

    return h(
      'div',
      {
        id: 'mmda-app-layout',
        class: uiCssClass('app-layout'),
        'data-layout': variant,
      },
      [
        slots.nav ?? null,
        h('div', { class: pageClass, role: 'main' }, pageBody),
        slots.bottomBar == null
          ? null
          : h(
              'footer',
              { class: uiCssClass('app-bottom') },
              [slots.bottomBar],
            ),
      ],
    )
  }
}

export const syncfusionLayout = new SyncfusionLayout()

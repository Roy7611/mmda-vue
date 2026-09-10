import { h, type VNode } from 'vue'
import type { UiListTileSlots } from '@mmda/core'
import { VueUiLayout } from '@mmda/vui'

export class AgNaiveLayout extends VueUiLayout {
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
}

export const agNaiveLayout = new AgNaiveLayout()

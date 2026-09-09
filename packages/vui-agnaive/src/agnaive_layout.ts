import { h, type VNode } from 'vue'
import type { UiListTileSlots, UiProps } from '@mmda/core'
import { VueUiLayout } from '@mmda/vui'

export class AgNaiveLayout extends VueUiLayout {
  cell(child: VNode, nCol = 1): VNode {
    return h(
      'div',
      {
        class: 'mmda-agnaive-cell',
        style: { gridColumn: `span ${Math.max(1, nCol)}` },
      },
      child,
    )
  }

  row(children: VNode[], nCols: number[], props: UiProps = {}): VNode {
    const { class: extraClass, style: extraStyle, ...rest } = props
    return h(
      'div',
      {
        class: ['mmda-agnaive-row', extraClass],
        style: {
          display: 'grid',
          gridTemplateColumns: nCols.map(value => `${value}fr`).join(' '),
          gap: '0.75rem',
          ...(extraStyle as Record<string, unknown> | undefined),
        },
        ...rest,
      },
      children,
    )
  }

  column(children: VNode[], props: UiProps = {}): VNode {
    const { class: extraClass, style: extraStyle, ...rest } = props
    return h(
      'div',
      {
        class: ['mmda-agnaive-column', extraClass],
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          ...(extraStyle as Record<string, unknown> | undefined),
        },
        ...rest,
      },
      children,
    )
  }

  grid(children: VNode[], nCols: number[], props: UiProps = {}): VNode {
    const { class: extraClass, style: extraStyle, ...rest } = props
    return h(
      'div',
      {
        class: ['mmda-agnaive-grid', extraClass],
        style: {
          display: 'grid',
          gridTemplateColumns:
            nCols.length > 0
              ? nCols.map(value => `${value}fr`).join(' ')
              : 'repeat(auto-fit, minmax(16rem, 1fr))',
          gap: '0.75rem',
          ...(extraStyle as Record<string, unknown> | undefined),
        },
        ...rest,
      },
      children,
    )
  }

  listTile(slots: UiListTileSlots<VNode>): VNode {
    return h('article', { class: 'mmda-agnaive-list-tile' }, [
      slots.leading?.(),
      h('div', { class: 'mmda-agnaive-list-tile__content' }, [
        slots.title(),
        slots.subtitle?.(),
      ]),
      slots.trailing?.(),
    ])
  }
}

export const agNaiveLayout = new AgNaiveLayout()

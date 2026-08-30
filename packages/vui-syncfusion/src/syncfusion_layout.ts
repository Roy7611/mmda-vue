import { h, type VNodeChild } from 'vue'
import type { UiLayout } from '@mmda/vui'

export const syncfusionLayout: UiLayout = {
  fieldLayout: 'horizontal',
  fieldMessage: false,
  wrapManyGroup: true,
  maxCols: 12,

  cell: (child: VNodeChild, nCol = 1) =>
    h(
      'div',
      {
        class: 'mmda-sf-cell',
        style: { gridColumn: `span ${Math.max(1, nCol)}` },
      },
      child as any,
    ),

  row: (children, nCols, props = {}) =>
    h(
      'div',
      {
        class: 'mmda-sf-row',
        style: {
          display: 'grid',
          gridTemplateColumns: nCols.map(value => `${value}fr`).join(' '),
          gap: '0.75rem',
        },
        ...props,
      },
      children,
    ),

  column: (children, props = {}) =>
    h(
      'div',
      {
        class: 'mmda-sf-column',
        style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
        ...props,
      },
      children,
    ),

  grid: (children, nCols, props = {}) =>
    h(
      'div',
      {
        class: 'mmda-sf-grid',
        style: {
          display: 'grid',
          gridTemplateColumns:
            nCols.length > 0
              ? nCols.map(value => `${value}fr`).join(' ')
              : 'repeat(auto-fit, minmax(16rem, 1fr))',
          gap: '0.75rem',
        },
        ...props,
      },
      children,
    ),

  listTile: slots =>
    h('article', { class: 'mmda-sf-list-tile' }, [
      slots.leading?.(),
      h('div', { class: 'mmda-sf-list-tile__content' }, [
        slots.title(),
        slots.subtitle?.(),
      ]),
      slots.trailing?.(),
    ]),
}

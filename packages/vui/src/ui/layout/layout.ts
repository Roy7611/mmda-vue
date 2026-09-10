import { h, type VNode } from 'vue'
import {
  AbstractUiLayout,
  uiCssClass,
  type UiAppLayoutVariant,
  type UiAppScaffoldSlots,
  type UiFieldGroupLayout,
  type UiPageSlots,
  type UiProps,
  type UiWrapProps,
} from '@mmda/core'
import type { ChildSlot } from '../../contexts/view'
import { PageBody } from '../../components/PageBody'

export type {
  UiOrientation,
  UiFieldGroupLayout,
  UiFieldGroupType,
  UiHorzAlign,
  UiVertAlign,
  UiFieldSlots,
  UiFieldMessageKind,
  UiFieldSpan,
  UiFieldCell,
  UiFieldGroupProps,
  UiWrapProps,
  UiPageSlots,
  UiLayout,
  AbstractUiLayout,
  UiListTileSlots,
  UiProps,
  HtmlAttributes,
  UiAppLayoutVariant,
  UiAppScaffoldSlots,
} from '@mmda/core'

export { htmlAttributesOf, placeFields } from '@mmda/core'

export type UiSlots = {
  [index: string]: any
  default?: ChildSlot
  header?: ChildSlot
  footer?: ChildSlot
}

function layoutDomProps(
  className: string,
  style: Record<string, unknown>,
  props: UiProps = {},
) {
  const { class: extraClass, style: extraStyle, ...rest } = props
  return {
    ...rest,
    class: [className, extraClass],
    style: { ...style, ...(extraStyle as Record<string, unknown> | undefined) },
  }
}

export class VueUiLayout extends AbstractUiLayout<VNode> {
  fieldGroupLayout: UiFieldGroupLayout = {
    type: 'grid',
    gridCols: 2,
  }
  maxCols = 12

  protected wrap(tag: string, props: UiWrapProps, children: VNode[]): VNode {
    return h(
      tag,
      layoutDomProps(
        props.className ?? '',
        props.style ?? {},
        props.attributes ?? {},
      ),
      children,
    )
  }

  protected pageBody(slots: UiPageSlots<VNode>): VNode[] {
    const summary = slots.summary ?? []
    const tails = slots.tails ?? []
    const hasSummary = summary.length > 0
    const hasTails = tails.length > 0
    return [
      h(
        PageBody,
        {
          hasSummary,
          summaryExpanded: slots.summaryExpanded !== false,
        },
        {
          banner: slots.banner == null ? undefined : () => slots.banner,
          primary: () => slots.primary,
          tails: hasTails ? () => tails : undefined,
          summary: hasSummary ? () => summary : undefined,
          footer: slots.footer == null ? undefined : () => slots.footer,
        },
      ),
    ]
  }

  scaffold(slots: UiAppScaffoldSlots<VNode>): VNode {
    const variant: UiAppLayoutVariant = slots.variant ?? 'sidebarLeft'
    const grid =
      variant === 'topBarFull'
        ? {
            gridTemplateAreas: '"top top" "nav page" "bottom bottom"',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            gridTemplateRows: 'auto minmax(0, 1fr) auto',
          }
        : slots.topBar != null
          ? {
              gridTemplateAreas: '"nav top" "nav page" "nav bottom"',
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: 'auto minmax(0, 1fr) auto',
            }
          : {
              gridTemplateAreas: '"nav page" "nav bottom"',
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              gridTemplateRows: 'minmax(0, 1fr) auto',
            }
    return h(
      'div',
      layoutDomProps(
        uiCssClass('app-layout'),
        {
          display: 'grid',
          ...grid,
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
        },
        { 'data-layout': variant },
      ),
      [
        slots.topBar == null
          ? null
          : h(
              'header',
              {
                class: uiCssClass('app-topbar'),
                style: { gridArea: 'top', minWidth: 0 },
              },
              slots.topBar,
            ),
        h(
          'nav',
          {
            class: uiCssClass('app-nav'),
            style: { gridArea: 'nav', minHeight: 0, overflow: 'auto' },
          },
          slots.nav,
        ),
        h(
          'main',
          {
            class: uiCssClass('app-page'),
            style: {
              gridArea: 'page',
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
            },
          },
          slots.page,
        ),
        slots.bottomBar == null
          ? null
          : h(
              'footer',
              {
                class: uiCssClass('app-bottom'),
                style: { gridArea: 'bottom' },
              },
              slots.bottomBar,
            ),
      ],
    )
  }
}

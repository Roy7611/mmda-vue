import { h, type VNode } from 'vue'
import {
  AbstractUiLayout,
  uiCssClass,
  uiCssClasses,
  type UiAppLayoutVariant,
  type UiAppScaffoldSlots,
  type UiFieldGroupLayout,
  type UiPageLayout,
  type UiPageSlots,
  type UiProps,
  type UiWrapProps,
} from '@mmda/core'
import type { ChildSlot } from '../../contexts/view'
import { PageBody } from '../../components/PageBody'
import {
  readStoredPageLayout,
  writeStoredPageLayout,
} from '../../app/theme'

export type {
  UiOrientation,
  UiFieldGroupLayout,
  UiFieldGroupType,
  UiHorzAlign,
  UiVertAlign,
  UiFieldSlots,
  UiFieldSpan,
  UiFieldCell,
  UiFieldGroupProps,
  UiWrapProps,
  UiPageSlots,
  UiPageLayout,
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

function normalizePageLayout(value: unknown): UiPageLayout {
  return value === 'tabs' ? 'tabs' : 'cards'
}

export class VueUiLayout extends AbstractUiLayout<VNode> {
  #pageLayout: UiPageLayout = readStoredPageLayout()

  fieldGroupLayout: UiFieldGroupLayout = {
    type: 'grid',
    gridCols: 2,
  }
  maxCols = 12

  get pageLayout(): UiPageLayout {
    return this.#pageLayout
  }

  set pageLayout(value: UiPageLayout) {
    const next = normalizePageLayout(value)
    this.#pageLayout = next
    writeStoredPageLayout(next)
  }

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

  /**
   * cards：sticky 工具栏 + PageBody（banner / content 包 main+summary）+ footer。
   * tabs：sticky 工具栏 + body 纵向 banner → emphasis → primary + footer。
   */
  layoutPage(slots: UiPageSlots<VNode>): VNode {
    const toolbarNode =
      slots.toolbar == null
        ? null
        : h(
            'header',
            {
              class: [
                uiCssClass('page', 'header'),
                uiCssClass('page', 'header', 'sticky'),
              ],
              style: { position: 'sticky', top: 0, zIndex: 2 },
            },
            slots.toolbar,
          )

    const footerNode =
      slots.footer == null
        ? null
        : h('footer', { class: uiCssClass('page', 'footer') }, slots.footer)

    if (slots.pageLayout === 'tabs') {
      const banner =
        slots.banner == null ||
        (Array.isArray(slots.banner) && slots.banner.length === 0)
          ? null
          : h('div', { class: uiCssClass('page', 'banner') }, slots.banner)
      const emphasis =
        slots.emphasis == null
          ? null
          : h('div', { class: uiCssClass('page', 'emphasis') }, slots.emphasis)
      const primary = h(
        'div',
        {
          class: [
            uiCssClass('section'),
            uiCssClass('section', undefined, 'main'),
            uiCssClass('page', 'tabs'),
          ],
          style: { flex: '1 1 0', minHeight: 0, minWidth: 0 },
        },
        slots.primary,
      )
      return h(
        'section',
        {
          class: uiCssClasses('page', 'tabs'),
          style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          },
        },
        [
          toolbarNode,
          h(
            'div',
            {
              class: uiCssClass('page', 'body'),
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 0',
                minHeight: 0,
                minWidth: 0,
                overflow: 'hidden',
              },
            },
            [banner, emphasis, primary],
          ),
          footerNode,
        ],
      )
    }

    const summary = slots.summary ?? []
    const tails = slots.tails ?? []
    const hasSummary = summary.length > 0
    const hasTails = tails.length > 0
    return h(
      'section',
      {
        class: uiCssClass('page'),
        style: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'auto',
        },
      },
      [
        toolbarNode,
        h(
          PageBody,
          {
            hasSummary,
            summaryExpanded: slots.summaryExpanded !== false,
          },
          {
            banner:
              slots.banner == null ||
              (Array.isArray(slots.banner) && slots.banner.length === 0)
                ? undefined
                : () => slots.banner,
            primary: () => slots.primary,
            tails: hasTails ? () => tails : undefined,
            summary: hasSummary ? () => summary : undefined,
          },
        ),
        footerNode,
      ],
    )
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

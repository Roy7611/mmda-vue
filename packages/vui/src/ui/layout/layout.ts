import { h, type VNode } from 'vue'
import type { UiProps } from '@mmda/core'
import {
  AbstractUiLayout,
  type UiFieldLayout,
  type UiPageLayoutOptions,
} from '@mmda/core'
import type { ChildSlot } from '../../contexts/view'
import { PageBody } from '../../components/PageBody'

export type {
  UiOrientation,
  UiDirection,
  UiFieldLayout,
  UiHorzAlign,
  UiVertAlign,
  UiFieldGroupOrientation,
  UiFieldLayoutOptions,
  UiFieldGroupLayoutOptions,
  UiPageLayoutOptions,
  UiLayout,
  AbstractUiLayout,
  UiListTileSlots,
  UiProps,
  HtmlAttributes,
  UiFixedColWidth,
  UiColWidth,
} from '@mmda/core'

export { htmlAttributesOf } from '@mmda/core'

export type UiSlots = {
  [index: string]: any
  default?: ChildSlot
  header?: ChildSlot
  footer?: ChildSlot
}

export type AppLayoutVariant = 'sidebarLeft' | 'topBarFull'

export interface AppLayoutOptions {
  topBar?: VNode
  nav?: VNode
  page?: VNode
  bottomBar?: VNode
  props?: UiProps
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
  fieldLayout: UiFieldLayout = 'horizontal'
  fieldMessage = false
  wrapManyGroup = true
  maxCols = 12

  protected wrap(
    className: string,
    style: Record<string, unknown>,
    props: UiProps | undefined,
    children: VNode[],
    tag = 'div',
  ): VNode {
    return h(tag, layoutDomProps(className, style, props ?? {}), children)
  }

  protected pageBody(options: UiPageLayoutOptions<VNode>): VNode[] {
    const summary = options.summary ?? []
    const tails = options.tails ?? []
    const hasSummary = summary.length > 0
    const hasTails = tails.length > 0
    return [
      h(
        PageBody,
        {
          hasSummary,
          summaryExpanded: options.summaryExpanded !== false,
        },
        {
          primary: () => options.primary,
          tails: hasTails ? () => tails : undefined,
          summary: hasSummary ? () => summary : undefined,
          footer:
            options.footer == null ? undefined : () => options.footer,
        },
      ),
    ]
  }
}

/**
 * 应用脚手架。外壳不滚动，导航和页面容器分别管理滚动。
 */
export class AppLayout {
  constructor(public readonly variant: AppLayoutVariant = 'sidebarLeft') {}

  render(
    options: AppLayoutOptions,
    variant: AppLayoutVariant = this.variant,
  ): VNode {
    return variant === 'topBarFull'
      ? this.topBarFull(options)
      : this.sidebarLeft(options)
  }

  sidebarLeft(options: AppLayoutOptions): VNode {
    const hasTopBar = options.topBar != null
    return this.scaffold(
      options,
      'sidebarLeft',
      hasTopBar
        ? {
            gridTemplateAreas: '"nav top" "nav page" "nav bottom"',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            gridTemplateRows: 'auto minmax(0, 1fr) auto',
          }
        : {
            gridTemplateAreas: '"nav page" "nav bottom"',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            gridTemplateRows: 'minmax(0, 1fr) auto',
          },
    )
  }

  topBarFull(options: AppLayoutOptions): VNode {
    return this.scaffold(options, 'topBarFull', {
      gridTemplateAreas: '"top top" "nav page" "bottom bottom"',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      gridTemplateRows: 'auto minmax(0, 1fr) auto',
    })
  }

  private scaffold(
    options: AppLayoutOptions,
    variant: AppLayoutVariant,
    grid: Record<string, string>,
  ): VNode {
    const { topBar, nav, page, bottomBar, props } = options
    return h(
      'div',
      layoutDomProps(
        'mmda-app-layout',
        {
          display: 'grid',
          ...grid,
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
        },
        { 'data-layout': variant, ...props },
      ),
      [
        topBar == null
          ? null
          : h(
              'header',
              {
                class: 'mmda-app-topbar',
                style: { gridArea: 'top', minWidth: 0 },
              },
              topBar,
            ),
        h(
          'nav',
          {
            class: 'mmda-app-nav',
            style: { gridArea: 'nav', minHeight: 0, overflow: 'auto' },
          },
          nav,
        ),
        h(
          'main',
          {
            class: 'mmda-app-page',
            style: {
              gridArea: 'page',
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
            },
          },
          page,
        ),
        bottomBar == null
          ? null
          : h(
              'footer',
              { class: 'mmda-app-bottom', style: { gridArea: 'bottom' } },
              bottomBar,
            ),
      ],
    )
  }
}

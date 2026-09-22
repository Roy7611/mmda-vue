import { h, type VNode } from 'vue'
import {
  AbstractUiLayout,
  uiRenderProps,
  type UiPageLayout,
  type UiPageSlots,
  type UiNodeProps,
} from '@mmda/core'
import type { ChildSlot } from '../contexts/view'
import { PageBody } from '../components/PageBody'
import { readStoredPageLayout } from '../app/theme'

export type VuiTileSlots = {
  [index: string]: any
  default?: ChildSlot
  header?: ChildSlot
  footer?: ChildSlot
}

export class VuiLayout extends AbstractUiLayout<VNode> {
  override pageLayout: UiPageLayout = readStoredPageLayout()

  render(tag: string, props: UiNodeProps, children: VNode[]): VNode {
    const bag = props.attributes ? uiRenderProps(props.attributes) : undefined
    const bagProps = (bag?.props ?? {}) as {
      class?: string
      style?: Record<string, unknown>
      [key: string]: unknown
    }
    return h(
      tag,
      {
        ...(bag?.attributes ?? {}),
        ...bagProps,
        class: [props.class ?? '', bagProps.class],
        style: { ...(props.style ?? {}), ...(bagProps.style ?? {}) },
      },
      children,
    )
  }

  /**
   * cards 主体：PageBody 提供 main|summary 双栏、摘要折叠与紧凑视口自动收起。
   * 页壳（工具栏 / banner / 页脚）由 core {@link AbstractUiLayout.layoutPage} 组装。
   */
  protected override layoutBodyCards(slots: UiPageSlots<VNode>): VNode {
    const summary = slots.summary ?? []
    const tails = slots.tails ?? []
    const hasSummary = summary.length > 0
    const hasTails = tails.length > 0
    return h(
      PageBody,
      {
        hasSummary,
        summaryExpanded: slots.summaryExpanded !== false,
      },
      {
        primary: () => slots.primary,
        tails: hasTails ? () => tails : undefined,
        summary: hasSummary ? () => summary : undefined,
      },
    )
  }

}

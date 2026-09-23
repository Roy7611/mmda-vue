import { createElement, type ReactNode } from 'react'
import {
  AbstractUiLayout,
  uiRenderProps,
  type UiAppScaffoldSlots,
  type UiNodeProps,
} from '@mmda/core'
import { reactRenderProps } from '../render_props'

/**
 * React 布局器：`extends AbstractUiLayout<ReactNode>`。
 * 只实现 `render` 造节点；scaffold 留到 P3 带 React Router 再做。
 */
export class RuiLayout extends AbstractUiLayout<ReactNode> {
  scaffold(_slots: UiAppScaffoldSlots<ReactNode>): ReactNode {
    throw new Error(
      'RuiLayout.scaffold requires a skin package (@mmda/rui-*).',
    )
  }

  render(
    tag: string,
    props: UiNodeProps,
    children: ReactNode[],
  ): ReactNode {
    const bagRui = props.attributes
      ? reactRenderProps(uiRenderProps(props.attributes))
      : ({} as Record<string, unknown>)
    const { className: bagClassName, style: bagStyle, ...restBag } = bagRui as {
      className?: string
      style?: Record<string, string | number>
      [key: string]: unknown
    }

    // 布局级 class / style 优先覆盖 attributes 里的同名项
    return createElement(
      tag,
      {
        className: props.class ?? bagClassName,
        style: props.style
          ? { ...bagStyle, ...props.style }
          : bagStyle,
        ...restBag,
      },
      ...children,
    )
  }
}

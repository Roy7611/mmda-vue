import { uiCssClass } from '../css'

export type UiSplitterOrientation = 'Horizontal' | 'Vertical'

export interface UiSplitterPane<TNode = any> {
  content: TNode
  size?: string
  min?: string
  max?: string
  collapsible?: boolean
  collapsed?: boolean
  resizable?: boolean
  cssClass?: string
}

export interface UiSplitterCollapseEvent {
  index: number
  collapsed: boolean
}

export interface UiSplitterResizeEvent {
  index: number
  paneSize?: number[]
}

export interface UiSplitterProps {
  orientation?: UiSplitterOrientation
  class?: string
  width?: string
  height?: string
  separatorSize?: number
  enabled?: boolean
  enableReversePanes?: boolean
  collapseTick?: number
  onCollapsed?: (event: UiSplitterCollapseEvent) => void
  onExpanded?: (event: UiSplitterCollapseEvent) => void
  onResizeStart?: (event: UiSplitterResizeEvent) => void
  onResizing?: (event: UiSplitterResizeEvent) => void
  onResizeStop?: (event: UiSplitterResizeEvent) => void
}

export function splitterModifierClasses(props: UiSplitterProps = {}): unknown[] {
  const orientation =
    props.orientation === 'Vertical' ? 'Vertical' : 'Horizontal'
  const reverse = props.enableReversePanes === true
  return [
    uiCssClass('splitter'),
    orientation === 'Vertical'
      ? uiCssClass('splitter', 'vertical')
      : uiCssClass('splitter', 'horizontal'),
    reverse ? uiCssClass('splitter', 'reverse') : undefined,
    props.class,
  ]
}

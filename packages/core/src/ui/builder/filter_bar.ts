import type { UiProps } from '../props'

/** 列表过滤条：列 FilterModel 芯片 + 可选额外芯片（快捷过滤以后放这里）。 */
export interface UiFilterBarProps<TNode = any> extends UiProps {
  /** 额外芯片（如快捷过滤）。接在列过滤芯片后面。 */
  chips?: () => TNode | TNode[]
}

import type { UiAction } from '../action'
import type { UiButtonProps, UiButtonSlots } from './button'

/**
 * SplitButton 透传插槽。`default` 是主按钮内容；菜单键的名字随厂商
 * （Prime `menubutton` / Naive `menu`），所以这一层留索引，性质同字段工厂的服务端名。
 */
export interface UiSplitButtonSlots<TNode = any>
  extends UiButtonSlots<TNode> {
  [slot: string]: (() => TNode[]) | undefined
}

export interface UiSplitButtonProps extends UiButtonProps {
  actions: UiAction[]
}

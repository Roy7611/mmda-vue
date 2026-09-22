/*
 * 模块首页（业务基础模块的页面级视图）。
 *
 * 页面本体在 `WorkbenchView.ts`（与 mes 共用一份），这里只声明 base 的标题文案键。
 * 框架无关：只吃 core 的 `UiViewDeps`，宿主（`packages/app`）用 `hostedView(...)` 包成组件。
 */
import type { UiViewDeps } from '@mmda/core'
import { workbenchView } from './WorkbenchView'

export function homeView<TNode>(deps: UiViewDeps<TNode>): TNode {
  return workbenchView(deps, { titleKey: 'home.workbench' })
}

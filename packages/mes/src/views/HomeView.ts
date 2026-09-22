/*
 * 模块首页（MES 的页面级视图）。
 *
 * 与 base 共用 `@mmda/base/src/views/WorkbenchView.ts` 的页面本体，只有标题文案键不同。
 * 框架无关：不 import vue / vue-router / vue-i18n，宿主包成组件后靠 `app.*` 拿数据与文案。
 */
import type { UiViewDeps } from '@mmda/core'
import { workbenchView } from '@mmda/base/src/views/WorkbenchView'

export function homeView<TNode>(deps: UiViewDeps<TNode>): TNode {
  return workbenchView(deps, { titleKey: 'view.scheduleWorkspace' })
}

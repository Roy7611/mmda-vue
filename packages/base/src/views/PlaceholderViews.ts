/*
 * 占位页（未实现的模块页）。与 `HomeView` 同样框架无关：
 * 文案走 `app.translate`，壳节点走 `render`。
 */
import type { UiViewDeps } from '@mmda/core'

export function customPages<TNode>(deps: UiViewDeps<TNode>): TNode {
  const { app, render } = deps
  return render('div', { style: { padding: '32px' } }, [
    render('h1', {}, [app.translate('placeholder.custom')]),
    render('p', {}, [app.translate('placeholder.customHint')]),
  ])
}

/**
 * 搜索页承载（`UiViewOne.Search`）：移动端全屏路由页，桌面端右侧抽屉。
 *
 * 内容 = `builder.buildSearchView`（同一份）；确定时把草稿写回列表会话（`applySearchDraft`）
 * 再查询，然后退回列表。承载由视口决定（`useCompactViewport`），路由只有一个。
 */
import { h, type VNode } from "vue"
import { applySearchDraft, uiCssClass, type UiContext } from "@mmda/core"
import type { VuiBuilder } from "../builder"

export interface SearchViewPageOptions {
  /** true = 移动端全屏页；false = 桌面右侧抽屉。 */
  compact: boolean
  /** 保活的列表会话；缺省写回搜索会话自己。 */
  list?: UiContext
  /** 返回 / 关闭。 */
  onClose: () => void
}

export function renderSearchViewPage(
  ui: VuiBuilder,
  context: UiContext,
  options: SearchViewPageOptions,
): VNode {
  const { compact, list, onClose } = options
  const content = ui.buildSearchView(context, {
    placement: compact ? "page" : "drawer",
    onConfirm: () => {
      const target = applySearchDraft(context, list)
      void (target ?? context).search?.()
      onClose()
    },
  })
  const body = h("div", { class: uiCssClass("search-view-page") }, [
    ui.factory.toolbar(
      { class: uiCssClass("search-view-page", "toolbar") },
      {
        default: () =>
          h("div", { class: uiCssClass("search-view-page", "header") }, [
            ui.factory.actionButton(
              {
                name: "back",
                label: "",
                icon: "back",
                tooltip: context.t("action.back"),
                onAction: () => onClose(),
              },
              (message) => context.t(message),
              true,
              {
                class: uiCssClass("search-view-page", "back"),
                buttonType: "text",
              },
            ),
            ui.factory.title({ text: context.t("view.search") }),
          ]),
      },
    ),
    content,
  ])
  if (compact) return ui.layout.layoutPage({ primary: [body] })
  return ui.factory.drawer(
    {
      class: uiCssClass("search-view-page", undefined, "drawer"),
      isOpen: true,
      position: "Right",
      width: 420,
      showBackdrop: true,
      closeOnDocumentClick: true,
      onChange: (isOpen: boolean) => {
        if (!isOpen) onClose()
      },
    },
    { default: () => body },
  )
}

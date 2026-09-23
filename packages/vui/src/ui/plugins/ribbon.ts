/*
 * Ribbon 是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(createSfRibbonPlugin())。
 * 与 factory.toolbar（原生命令条）和 Topbar 都无关。契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiRibbonPlugin as CorePlugin } from '@mmda/core'

export type {
  UiRibbonItemType,
  UiRibbonMenuItem,
  UiRibbonItem,
  UiRibbonCollection,
  UiRibbonGroup,
  UiRibbonTab,
  UiRibbonLayout,
  UiRibbonProps,
  UiRibbonPlugin,
} from '@mmda/core'

export {
  RIBBON_PLUGIN_NOT_INSTALLED,
  unimplementedRibbonPlugin,
  ribbonHookClass,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VuiRibbonPlugin = CorePlugin<VNode>

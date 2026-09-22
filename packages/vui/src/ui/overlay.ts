import type { VNode } from 'vue'
import type { UiOverlay as CoreUiOverlay } from '@mmda/core'

/** core UiOverlay 钉成 VNode；无额外方法则 type 别名。 */
export type VuiOverlay = CoreUiOverlay<VNode>

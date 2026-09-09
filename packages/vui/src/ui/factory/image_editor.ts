/*
 * 图片编辑是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setImageEditorPlugin(createSfImageEditorPlugin())
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiImageEditorPlugin as CorePlugin } from '@mmda/core'

export type {
  UiImageEditorTool,
  UiImageEditorSave,
  UiImageEditorProps,
  UiImageEditorPlugin,
} from '@mmda/core'

export {
  UI_IMAGE_EDITOR_TOOLS,
  IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
  unimplementedImageEditorPlugin,
  imageEditorHookClass,
  resolveImageEditorTools,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueImageEditorPlugin = CorePlugin<VNode>

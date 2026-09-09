/*
 * 图片编辑是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setImageEditorPlugin(createSfImageEditorPlugin())
 */
import type { VNode } from 'vue'
import type {UiProps} from '../layout/layout'

export type UiImageEditorTool = 'crop' | 'rotate' | 'flip'

export const UI_IMAGE_EDITOR_TOOLS: UiImageEditorTool[] = [
  'crop',
  'rotate',
  'flip',
]

export interface UiImageEditorSave {
  blob: Blob
  dataUrl: string
}

export interface UiImageEditorProps extends UiProps {
  src?: string
  readonly?: boolean
  width?: string | number
  height?: string | number
  tools?: UiImageEditorTool[]
  onSave?: (result: UiImageEditorSave) => void
}

export interface UiImageEditorPlugin {
  installed?: boolean
  imageEditor: (props: UiImageEditorProps) => VNode
}

export const IMAGE_EDITOR_PLUGIN_NOT_INSTALLED =
  'image editor plugin not installed'

function notInstalled(): never {
  throw new Error(IMAGE_EDITOR_PLUGIN_NOT_INSTALLED)
}

export function unimplementedImageEditorPlugin(): UiImageEditorPlugin {
  return { installed: false, imageEditor: notInstalled }
}

export function imageEditorHookClass(
  extra?: unknown,
  readonly?: boolean,
): unknown[] {
  return [
    'mmda-image-editor',
    readonly ? 'mmda-image-editor--readonly' : undefined,
    extra,
  ]
}

export function resolveImageEditorTools(
  props: Pick<UiImageEditorProps, 'tools'>,
): UiImageEditorTool[] {
  return props.tools?.length ? props.tools : [...UI_IMAGE_EDITOR_TOOLS]
}

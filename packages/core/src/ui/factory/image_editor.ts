/**
 * 图片编辑器插件契约。无 Vue。
 * 不进 chrome UiFactory；App 挂 Builder 插件。
 */
import type { UiProps } from '../props'

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

export interface UiImageEditorPlugin<TNode = any> {
  installed?: boolean
  imageEditor: (props: UiImageEditorProps) => TNode
}

export const IMAGE_EDITOR_PLUGIN_NOT_INSTALLED =
  'image editor plugin not installed'

function notInstalled(): never {
  throw new Error(IMAGE_EDITOR_PLUGIN_NOT_INSTALLED)
}

export function unimplementedImageEditorPlugin<
  TNode = any,
>(): UiImageEditorPlugin<TNode> {
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

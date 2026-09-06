import type { MetaUiField } from '../metaui/metaui_field'

export type UiFieldRenderer<TNode = any> = (
  field: MetaUiField,
  context: any,
  props?: Record<string, unknown>,
) => TNode

/**
 * 字段渲染器表。皮肤用编辑器名做索引；Logic 会点到的键在此声明。
 */
export interface UiFieldFactory<TNode = any>
  extends Record<string, UiFieldRenderer<TNode> | undefined> {
  fallbackDisplay: UiFieldRenderer<TNode>
  fallbackInput: UiFieldRenderer<TNode>
  HasOneText?: UiFieldRenderer<TNode>
  imageUpload?: UiFieldRenderer<TNode>
  associationTable?: UiFieldRenderer<TNode>
}

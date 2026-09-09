import { uiCssClass } from '../css'
import type { UiProps } from '../props'

export type UiRatingTemplateContext = { value: number; index: number }

export type UiRatingTemplate<TNode = any> =
  | TNode
  | ((ctx: UiRatingTemplateContext) => TNode)

export interface UiRatingProps<TNode = any> extends UiProps {
  value?: number | null
  /** EJ2：格子数。默认 5。不要 vui 主名 stars */
  itemsCount?: number
  /** EJ2 拼写。不要 vui 主名 readonly */
  readOnly?: boolean
  disabled?: boolean
  emptyTemplate?: UiRatingTemplate<TNode>
  fullTemplate?: UiRatingTemplate<TNode>
  onChange?: (value: number | null) => void
}

export function ratingModifierClasses(props: UiRatingProps): unknown[] {
  return [uiCssClass('rating'), props.class]
}

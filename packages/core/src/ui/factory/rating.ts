import { uiCssClass } from '../css'
import type { UiProps } from '../props'
import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
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

export const DEFAULT_RATING_ITEMS_COUNT = 5

function ratingItemsCountFromField(field: MetaUiField): number {
  const max = field.maxLength
  if (typeof max === 'number' && max >= 1 && max <= 10) return max
  return DEFAULT_RATING_ITEMS_COUNT
}

export function ratingPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
): UiRatingProps {
  const raw = context.getFieldValue(field)
  const n = raw == null || raw === '' ? Number.NaN : Number(raw)
  return {
    value: Number.isFinite(n) ? n : null,
    itemsCount: ratingItemsCountFromField(field),
    readOnly: context.isFieldReadonly(field),
    disabled: context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

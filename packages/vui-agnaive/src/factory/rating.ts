import { h } from 'vue'
import { NRate } from 'naive-ui'
import type { UiRatingProps } from '@mmda/vui'
import {
  emitRatingChange,
  htmlAttributesOf,
  ratingItemsCountOf,
  ratingModifierClasses,
  ratingReadOnlyOf,
  ratingValueOf,
  resolveRatingTemplate,
} from '@mmda/vui'

export function createRating(props: UiRatingProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    itemsCount: _itemsCount,
    readOnly: _readOnly,
    disabled,
    onChange: _onChange,
    emptyTemplate,
    fullTemplate,
    htmlAttributes,
    class: _className,
    ...rest
  } = props

  const current = ratingValueOf(props) ?? 0
  const slots =
    emptyTemplate != null || fullTemplate != null
      ? {
          default: ({ index }: { index: number }) => {
            const filled = index < current
            const template = filled
              ? (fullTemplate ?? emptyTemplate)
              : (emptyTemplate ?? fullTemplate)
            return resolveRatingTemplate(template, {
              value: current,
              index,
            })
          },
        }
      : undefined

  return h(
    NRate,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: current,
      count: ratingItemsCountOf(props),
      readonly: ratingReadOnlyOf(props),
      disabled: disabled === true || disabled === 'true',
      class: ratingModifierClasses(props).flat(),
      'onUpdate:value': (next: unknown) => emitRatingChange(props, next),
    },
    slots,
  )
}

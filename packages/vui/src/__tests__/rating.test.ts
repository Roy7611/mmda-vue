import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_RATING_ITEMS_COUNT,
  emitRatingChange,
  ratingItemsCountOf,
  ratingPropsFromField,
  ratingReadOnlyOf,
  ratingValueOf,
} from '../ui/factory/rating'

describe('rating chrome helpers', () => {
  it('defaults itemsCount to 5', () => {
    expect(ratingItemsCountOf({})).toBe(DEFAULT_RATING_ITEMS_COUNT)
    expect(ratingItemsCountOf({ itemsCount: 2 })).toBe(2)
  })

  it('reads value from value or modelValue', () => {
    expect(ratingValueOf({ value: 3 })).toBe(3)
    expect(ratingValueOf({ modelValue: 4 } as any)).toBe(4)
    expect(ratingValueOf({})).toBeNull()
  })

  it('uses EJ2 readOnly spelling', () => {
    expect(ratingReadOnlyOf({})).toBe(false)
    expect(ratingReadOnlyOf({ readOnly: true })).toBe(true)
  })

  it('unpacks EJ2 valueChanged args', () => {
    const onChange = vi.fn()
    emitRatingChange({ onChange }, { value: 2 })
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('translates field maxLength 1–10 to itemsCount', () => {
    const setFieldValue = vi.fn()
    const props = ratingPropsFromField(
      { fieldName: 'importance', maxLength: 2 } as any,
      {
        getFieldValue: () => 1,
        setFieldValue,
        isFieldReadonly: () => true,
      },
    )
    expect(props.value).toBe(1)
    expect(props.itemsCount).toBe(2)
    expect(props.readOnly).toBe(true)
  })
})

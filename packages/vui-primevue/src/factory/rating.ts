import { h } from "vue";
import Rating from "primevue/rating";
import type { UiRatingProps } from "@mmda/vui";
import {
  emitRatingChange,
  htmlAttributesOf,
  ratingItemsCountOf,
  ratingModifierClasses,
  ratingReadOnlyOf,
  ratingValueOf,
  resolveRatingTemplate,
} from "@mmda/vui";

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
    ...rest
  } = props;

  const current = ratingValueOf(props) ?? 0;
  const slots: Record<string, () => unknown> = {};
  if (fullTemplate != null) {
    slots.onicon = () =>
      resolveRatingTemplate(fullTemplate, { value: current, index: 0 });
  }
  if (emptyTemplate != null) {
    slots.officon = () =>
      resolveRatingTemplate(emptyTemplate, { value: current, index: 0 });
  }

  return h(
    Rating,
    {
      ...rest,
      ...htmlAttributesOf(props),
      modelValue: ratingValueOf(props),
      stars: ratingItemsCountOf(props),
      readonly: ratingReadOnlyOf(props),
      disabled: disabled === true || disabled === "true",
      cancel: false,
      class: ratingModifierClasses(props).flat(),
      "onUpdate:modelValue": (next: unknown) => emitRatingChange(props, next),
    },
    Object.keys(slots).length ? slots : undefined,
  );
}

import { h } from "vue";
import { RatingComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiRatingProps, UiRatingTemplate } from "@mmda/vui"
import { emitRatingChange, htmlAttributesOf, ratingItemsCountOf, ratingModifierClasses, ratingReadOnlyOf, ratingValueOf, resolveRatingTemplate } from "@mmda/vui"

function toEj2Template(
  template: UiRatingTemplate | undefined,
  props: UiRatingProps,
) {
  if (template == null) return undefined;
  if (typeof template === "string") return template;
  return (args?: { index?: number }) =>
    resolveRatingTemplate(template, {
      value: ratingValueOf(props) ?? 0,
      index: args?.index ?? 0,
    });
}

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
  } = props;

  const cssClass = ratingModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const isDisabled = disabled === true;

  return h(RatingComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: ratingValueOf(props) ?? 0,
    itemsCount: ratingItemsCountOf(props),
    readOnly: ratingReadOnlyOf(props),
    disabled: isDisabled,
    cssClass,
    ...(emptyTemplate != null
      ? { emptyTemplate: toEj2Template(emptyTemplate, props) }
      : {}),
    ...(fullTemplate != null
      ? { fullTemplate: toEj2Template(fullTemplate, props) }
      : {}),
    valueChanged: (args: { value?: unknown }) => emitRatingChange(props, args),
  });
}

import { h } from "vue";
import { MultiSelectComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiTagAutoCompleteProps } from "@mmda/vui";
import {
  htmlAttributesOf,
  tagAutoCompleteItemsOf,
  tagAutoCompleteModifierClasses,
  tagAutoCompleteSuggestionLabels,
  tagAutoCompleteTextOf,
  tagAutoCompleteUpdateOf,
} from "@mmda/vui";

export function createTagAutoComplete(
  value: string,
  props: UiTagAutoCompleteProps = {},
) {
  const {
    options: _options,
    suggest: _suggest,
    reference: _reference,
    minLength: _minLength,
    debounceDelay: _debounceDelay,
    highlight: _highlight,
    suggestionCount: _suggestionCount,
    onUpdate: _onUpdate,
    class: _className,
    htmlAttributes,
    size: _size,
    placeholder,
    disabled,
    separator: _separator,
    ...rest
  } = props;

  const labels = tagAutoCompleteSuggestionLabels(props).map((label) => ({
    value: label,
    label,
  }));
  const emit = tagAutoCompleteUpdateOf(props);
  const cssClass = tagAutoCompleteModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(MultiSelectComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    dataSource: labels,
    fields: { value: "value", text: "label" },
    value: tagAutoCompleteItemsOf(props.modelValue ?? value, props),
    mode: "Box",
    allowCustomValue: true,
    placeholder,
    enabled: disabled !== true,
    allowFiltering: true,
    cssClass,
    change: (args: { value?: string[] }) => {
      emit?.(
        tagAutoCompleteTextOf(
          Array.isArray(args?.value) ? args.value.map(String) : [],
          props,
        ),
      );
    },
  });
}

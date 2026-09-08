import { h } from "vue";
import { AutoCompleteComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiAutoCompleteProps } from "@mmda/vui";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  autoCompleteBindValue,
  autoCompleteModifierClasses,
  autoCompleteSuggestionLabels,
  autoCompleteUpdateOf,
} from "@mmda/vui";

export function createAutoComplete(
  value: string,
  props: UiAutoCompleteProps = {},
) {
  const minLength = props.minLength ?? AUTOCOMPLETE_MIN_LENGTH;
  const suggestionCount =
    props.suggestionCount ?? AUTOCOMPLETE_SUGGESTION_COUNT;
  const labels = autoCompleteSuggestionLabels(props).slice(0, suggestionCount);
  const emit = autoCompleteUpdateOf(props);
  const {
    options: _options,
    suggest,
    reference: _reference,
    minLength: _minLength,
    debounceDelay,
    highlight,
    suggestionCount: _suggestionCount,
    onUpdate: _onUpdate,
    class: _className,
    htmlAttributes,
    size: _size,
    placeholder,
    disabled,
    ...rest
  } = props;

  const onChange = (args: any) => {
    emit?.(String(args?.value ?? args?.text ?? ""));
  };

  return h(AutoCompleteComponent as any, {
    ...rest,
    value: autoCompleteBindValue(props.modelValue ?? value, props),
    dataSource: labels,
    allowCustom: true,
    allowFiltering: true,
    minLength,
    debounceDelay: debounceDelay ?? AUTOCOMPLETE_DEBOUNCE_MS,
    highlight: highlight === true,
    suggestionCount,
    placeholder,
    enabled: disabled !== true,
    htmlAttributes,
    cssClass: autoCompleteModifierClasses(props).filter(Boolean).join(" "),
    filtering: suggest
      ? (args: any) => {
          args.preventDefaultAction = true;
          const query = String(args?.text ?? "");
          if (query.length < minLength) {
            args.updateData?.([]);
            return;
          }
          void Promise.resolve(suggest(query)).then((rows) => {
            const next = (rows ?? [])
              .map((item: string | { label?: string; value?: string }) =>
                typeof item === "string" ? item : (item.label ?? item.value ?? ""),
              )
              .slice(0, suggestionCount);
            args.updateData?.(next);
          });
        }
      : undefined,
    input: onChange,
    change: onChange,
  });
}

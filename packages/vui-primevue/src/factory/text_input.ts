import { h } from "vue";
import InputText from "primevue/inputtext";
import type { UiTextInputProps } from "@mmda/vui";
import {
  emitTextInputBlur,
  emitTextInputChange,
  emitTextInputFocus,
  htmlAttributesOf,
  textInputAutocompleteOf,
  textInputDisabledOf,
  textInputHtmlTypeOf,
  textInputMaxLengthOf,
  textInputModifierClasses,
  textInputPlaceholderOf,
  textInputReadonlyOf,
  textInputTypeOf,
  textInputValueOf,
} from "@mmda/vui";

export function createTextInput(props: UiTextInputProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    placeholder: _placeholder,
    disabled: _disabled,
    readonly: _readonly,
    type: _type,
    maxLength: _maxLength,
    showClearButton: _showClear,
    autocomplete: _autocomplete,
    width,
    onChange: _onChange,
    onFocus: _onFocus,
    onBlur: _onBlur,
    htmlAttributes,
    ...rest
  } = props;

  const maxLength = textInputMaxLengthOf(props);
  const autocomplete = textInputAutocompleteOf(props);

  return h(InputText, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: textInputValueOf(props),
    placeholder: textInputPlaceholderOf(props),
    disabled: textInputDisabledOf(props),
    readonly: textInputReadonlyOf(props),
    type: textInputHtmlTypeOf(textInputTypeOf(props)),
    ...(maxLength != null ? { maxlength: maxLength } : {}),
    ...(autocomplete ? { autocomplete } : {}),
    ...(width != null ? { style: { width } } : {}),
    class: textInputModifierClasses(props).flat(),
    "onUpdate:modelValue": (next: unknown) => emitTextInputChange(props, next),
    onFocus: () => emitTextInputFocus(props),
    onBlur: () => emitTextInputBlur(props),
  });
}

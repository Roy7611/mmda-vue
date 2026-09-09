import { h } from "vue";
import { TextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiTextInputProps } from "@mmda/core"
import { emitTextInputBlur, emitTextInputChange, emitTextInputFocus, textInputAutocompleteOf, textInputDisabledOf, textInputMaxLengthOf, textInputModifierClasses, textInputPlaceholderOf, textInputReadonlyOf, textInputShowClearButtonOf, textInputTypeOf, textInputValueOf } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

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
    class: _className,
    ...rest
  } = props;

  const cssClass = textInputModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const maxLength = textInputMaxLengthOf(props);
  const autocomplete = textInputAutocompleteOf(props);
  const attrs = {
    ...htmlAttributesOf(props),
    ...(autocomplete ? { autocomplete } : {}),
  };

  return h(TextBoxComponent as any, {
    ...rest,
    value: textInputValueOf(props),
    placeholder: textInputPlaceholderOf(props),
    enabled: !textInputDisabledOf(props),
    readonly: textInputReadonlyOf(props),
    type: textInputTypeOf(props),
    ...(maxLength != null ? { maxLength } : {}),
    showClearButton: textInputShowClearButtonOf(props),
    ...(width != null ? { width } : {}),
    cssClass,
    htmlAttributes: attrs,
    input: (args: { value?: unknown }) => emitTextInputChange(props, args),
    change: (args: { value?: unknown }) => emitTextInputChange(props, args),
    focus: () => emitTextInputFocus(props),
    blur: () => emitTextInputBlur(props),
  });
}

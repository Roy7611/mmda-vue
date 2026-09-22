import { createElement, type ReactElement } from "react";
import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import {
  emitTextInputBlur,
  emitTextInputFocus,
  textInputAutocompleteOf,
  textInputDisabledOf,
  textInputMaxLengthOf,
  textInputModifierClasses,
  textInputPlaceholderOf,
  textInputReadonlyOf,
  textInputShowClearButtonOf,
  textInputTypeOf,
  textInputValueOf,
  type UiTextInputProps,
} from "@mmda/core";
import { sfCssClass, sfHtmlAttributes } from "./utils";

export function createTextInput(props: UiTextInputProps): ReactElement {
  const maxLength = textInputMaxLengthOf(props);
  const autocomplete = textInputAutocompleteOf(props);

  return createElement(TextBoxComponent as any, {
    value: textInputValueOf(props),
    placeholder: textInputPlaceholderOf(props),
    enabled: !textInputDisabledOf(props),
    readonly: textInputReadonlyOf(props),
    type: textInputTypeOf(props),
    showClearButton: textInputShowClearButtonOf(props),
    ...(maxLength != null ? { maxLength } : {}),
    ...(autocomplete ? { autocomplete } : {}),
    cssClass: sfCssClass(props, textInputModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    input: (args: { value?: unknown }) =>
      props.onChange?.(String(args?.value ?? "")),
    change: (args: { value?: unknown }) =>
      props.onChange?.(String(args?.value ?? "")),
    focus: () => emitTextInputFocus(props),
    blur: () => emitTextInputBlur(props),
  });
}

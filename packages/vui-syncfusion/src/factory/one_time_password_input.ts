import { h } from "vue";
import { OtpInputComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiOneTimePasswordInputProps } from "@mmda/vui"
import { emitOneTimePasswordChange, htmlAttributesOf, oneTimePasswordLengthOf, oneTimePasswordModifierClasses, oneTimePasswordTypeOf, oneTimePasswordValueOf } from "@mmda/vui"

export function createOneTimePasswordInput(
  props: UiOneTimePasswordInputProps,
) {
  const {
    value: _value,
    modelValue: _modelValue,
    length: _length,
    type: _type,
    separator,
    placeholder,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = oneTimePasswordModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  const emit = (args: { value?: string | number } | string | number) => {
    const next =
      typeof args === "object" && args != null && "value" in args
        ? args.value
        : args;
    emitOneTimePasswordChange(props, next);
  };

  return h(OtpInputComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: oneTimePasswordValueOf(props),
    length: oneTimePasswordLengthOf(props),
    type: oneTimePasswordTypeOf(props),
    separator: separator ?? "",
    placeholder,
    disabled: disabled === true,
    cssClass,
    htmlAttributes,
    valueChanged: emit,
  });
}

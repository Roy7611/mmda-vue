import { h } from "vue";
import InputOtp from "primevue/inputotp";
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
    placeholder: _placeholder,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  const length = oneTimePasswordLengthOf(props);
  const type = oneTimePasswordTypeOf(props);
  const vnodeProps = {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: oneTimePasswordValueOf(props),
    length,
    integerOnly: type === "number",
    mask: type === "password",
    disabled: disabled === true,
    class: [...oneTimePasswordModifierClasses(props)].flat(),
    "onUpdate:modelValue": (next: string | undefined) =>
      emitOneTimePasswordChange(props, next ?? ""),
  };

  if (!separator) {
    return h(InputOtp, vnodeProps);
  }

  return h(InputOtp, vnodeProps, {
    default: (slotProps: {
      attrs?: Record<string, unknown>;
      events?: Record<string, unknown>;
      index: number;
    }) => [
      h("input", {
        ...slotProps.attrs,
        ...slotProps.events,
        type: type === "password" ? "password" : "text",
      }),
      slotProps.index < length - 1
        ? h("span", { class: "mmda-otpinput__sep" }, separator)
        : null,
    ],
  });
}

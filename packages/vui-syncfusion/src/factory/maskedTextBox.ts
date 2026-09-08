import { h } from "vue";
import { MaskedTextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiMaskedTextBoxProps } from "@mmda/vui";
import {
  emitMaskedTextBoxChange,
  htmlAttributesOf,
  maskedTextBoxModifierClasses,
  maskedTextBoxValueOf,
} from "@mmda/vui";

export function createMaskedTextBox(props: UiMaskedTextBoxProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    mask,
    placeholder,
    disabled,
    promptChar,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = maskedTextBoxModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  const emit = (args: { value?: string } | string) => {
    const next =
      typeof args === "string" ? args : (args?.value ?? "");
    emitMaskedTextBoxChange(props, next);
  };

  return h(MaskedTextBoxComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: maskedTextBoxValueOf(props),
    mask,
    placeholder,
    promptChar,
    enabled: disabled !== true && disabled !== "true",
    cssClass,
    htmlAttributes,
    change: emit,
    input: emit,
  });
}

import { h } from "vue";
import InputMask from "primevue/inputmask";
import type { UiMaskedTextBoxProps } from "@mmda/vui"
import { emitMaskedTextBoxChange, htmlAttributesOf, maskedTextBoxModifierClasses, maskedTextBoxValueOf, primeMaskOf } from "@mmda/vui"

export function createMaskedTextBox(props: UiMaskedTextBoxProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    mask,
    placeholder,
    disabled,
    promptChar: _promptChar,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  return h(InputMask, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: maskedTextBoxValueOf(props),
    mask: primeMaskOf(mask),
    placeholder,
    disabled: disabled === true,
    class: [...maskedTextBoxModifierClasses(props)].flat(),
    "onUpdate:modelValue": (next: string | undefined) =>
      emitMaskedTextBoxChange(props, next ?? ""),
  });
}

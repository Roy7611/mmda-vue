import { h } from "vue";
import InputMask from "primevue/inputmask";
import type { UiMaskedTextBoxProps } from "@mmda/vui"
import { emitMaskedTextBoxChange, maskedTextBoxModifierClasses, maskedTextBoxValueOf, primeMaskOf } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"
import type { VuiModelProps } from "@mmda/vui"

export function createMaskedTextBox(props: VuiModelProps<UiMaskedTextBoxProps>) {
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
    ...uiRenderProps(props).attributes,
    modelValue: maskedTextBoxValueOf(props),
    mask: primeMaskOf(mask),
    placeholder,
    disabled: disabled === true,
    class: [...maskedTextBoxModifierClasses(props)].flat(),
    "onUpdate:modelValue": (next: string | undefined) =>
      emitMaskedTextBoxChange(props, next ?? ""),
  });
}

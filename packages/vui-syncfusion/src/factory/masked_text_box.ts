import { h } from "vue";
import { MaskedTextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiMaskedTextBoxProps } from "@mmda/vui"
import { emitMaskedTextBoxChange, maskedTextBoxModifierClasses, maskedTextBoxValueOf, type VuiModelProps } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

export function createMaskedTextBox(props: VuiModelProps<UiMaskedTextBoxProps>) {
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
    ...uiRenderProps(props).attributes,
    value: maskedTextBoxValueOf(props),
    mask,
    placeholder,
    promptChar,
    enabled: disabled !== true,
    cssClass,
    htmlAttributes,
    change: emit,
    input: emit,
  });
}

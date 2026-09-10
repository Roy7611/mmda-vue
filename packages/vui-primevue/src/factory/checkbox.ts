import { h } from "vue";
import Checkbox from "primevue/checkbox";
import type { UiCheckBoxProps } from "@mmda/core"
import { checkBoxCheckedOf, checkBoxModifierClasses } from "@mmda/core"
import { emitCheckBoxChange } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

export function createCheckBox(props: UiCheckBoxProps) {
  const {
    checked: _checked,
    modelValue: _modelValue,
    label,
    indeterminate,
    disabled,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  const attrs = htmlAttributesOf(props);
  const inputId = attrs.id || attrs.name;

  return h(
    "span",
    {
      ...rest,
      class: [...checkBoxModifierClasses(props)].flat(),
    },
    [
      h(Checkbox, {
        ...attrs,
        inputId,
        binary: true,
        modelValue: checkBoxCheckedOf(props),
        disabled,
        ...(indeterminate === true ? { indeterminate: true } : {}),
        "onUpdate:modelValue": (value: boolean) =>
          emitCheckBoxChange(props, Boolean(value)),
      }),
      label
        ? h("label", { class: "mmda-checkbox__label", for: inputId }, label)
        : null,
    ],
  );
}

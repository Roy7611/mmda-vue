import { h } from "vue";
import { CheckBoxComponent } from "@syncfusion/ej2-vue-buttons";
import type { UiCheckBoxProps } from "@mmda/core"
import { checkBoxCheckedOf, checkBoxModifierClasses, emitCheckBoxChange } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

export function createCheckBox(props: UiCheckBoxProps) {
  const {
    checked: _checked,
    modelValue: _modelValue,
    label,
    indeterminate,
    disabled,
    onChange: _onChange,
    onUpdate: _onUpdate,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = checkBoxModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(CheckBoxComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    checked: checkBoxCheckedOf(props),
    label,
    disabled,
    ...(indeterminate === true ? { indeterminate: true } : {}),
    cssClass,
    change: (args: { checked?: boolean }) => {
      emitCheckBoxChange(props, Boolean(args?.checked));
    },
  });
}

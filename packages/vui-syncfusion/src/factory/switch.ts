import { h } from "vue";
import { SwitchComponent } from "@syncfusion/ej2-vue-buttons";
import type { UiSwitchProps } from "@mmda/core"
import { switchCheckedOf, switchModifierClasses, uiRenderProps } from "@mmda/core"
import { emitSwitchChange, type VuiEmitProps } from "@mmda/vui"

export function createSwitch(props: VuiEmitProps<UiSwitchProps>) {
  const {
    checked: _checked,
    modelValue: _modelValue,
    onLabel,
    offLabel,
    disabled,
    onChange: _onChange,
    onUpdate: _onUpdate,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = switchModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(SwitchComponent as any, {
    ...rest,
    ...uiRenderProps(props).attributes,
    checked: switchCheckedOf(props),
    onLabel,
    offLabel,
    disabled,
    cssClass,
    change: (args: { checked?: boolean }) => {
      emitSwitchChange(props, Boolean(args?.checked));
    },
  });
}

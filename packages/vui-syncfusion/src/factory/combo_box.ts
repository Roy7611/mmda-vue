import { h } from "vue";
import { ComboBoxComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiComboBoxProps } from "@mmda/vui";
import {
  SELECT_DEBOUNCE_MS,
  comboBoxAllowCustom,
  comboBoxModifierClasses,
  comboBoxValueOf,
  emitComboBoxChange,
  htmlAttributesOf,
  selectOptionsOf,
} from "@mmda/vui";
import {
  syncfusionSelectFields,
  syncfusionSelectFiltering,
  syncfusionSelectItemTemplate,
} from "./drop_down_list";

export function createComboBox(props: UiComboBoxProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    placeholder,
    disabled,
    allowFiltering,
    allowCustom: _allowCustom,
    suggest: _suggest,
    minLength: _minLength,
    debounceDelay,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const options = selectOptionsOf(props);
  const cssClass = comboBoxModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(ComboBoxComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: comboBoxValueOf(props) ?? null,
    dataSource: options,
    fields: syncfusionSelectFields(options),
    placeholder,
    enabled: disabled !== true,
    allowFiltering: allowFiltering !== false,
    allowCustom: comboBoxAllowCustom(props),
    debounceDelay: debounceDelay ?? SELECT_DEBOUNCE_MS,
    cssClass,
    itemTemplate: syncfusionSelectItemTemplate(options),
    filtering: syncfusionSelectFiltering(props, options),
    change: (args: { value?: string | number | null }) => {
      emitComboBoxChange(props, args?.value ?? null);
    },
  });
}

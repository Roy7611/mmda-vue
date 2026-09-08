import { h } from "vue";
import { MultiSelectComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiMultiSelectProps } from "@mmda/vui";
import {
  SELECT_DEBOUNCE_MS,
  applyAndEmitMultiSelectKeys,
  htmlAttributesOf,
  multiSelectChromeOptionsOf,
  multiSelectModifierClasses,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectSelectedKeysOf,
  withMultiSelectBindMode,
} from "@mmda/vui";

function dataSourceOf(props: UiMultiSelectProps) {
  return multiSelectChromeOptionsOf(props).map((item) => ({
    value: multiSelectOptionKeyOf(item, props),
    label: multiSelectOptionLabelOf(item, props),
  }));
}

export function createMultiSelect(props: UiMultiSelectProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    options: _options,
    bindMode: _bindMode,
    valueField: _valueField,
    labelField: _labelField,
    separator: _separator,
    display: _display,
    placeholder,
    disabled,
    allowFiltering,
    suggest: _suggest,
    reference: _reference,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const cssClass = multiSelectModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(MultiSelectComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    dataSource: dataSourceOf(props),
    fields: { value: "value", text: "label" },
    value: multiSelectSelectedKeysOf(props),
    mode: "CheckBox",
    showSelectAll: true,
    placeholder,
    enabled: disabled !== true,
    allowFiltering: allowFiltering !== false,
    debounceDelay: SELECT_DEBOUNCE_MS,
    cssClass,
    change: (args: { value?: Array<string | number> }) => {
      applyAndEmitMultiSelectKeys(
        props,
        Array.isArray(args?.value) ? args.value : [],
      );
    },
  });
}

export function createMultiItemSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, "item_array"));
}

export function createMultiValueSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, "value_array"));
}

export function createMultiTextSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, "join_text"));
}

export function createMultiBitSelect(props: UiMultiSelectProps) {
  return createMultiSelect(withMultiSelectBindMode(props, "or_bits"));
}

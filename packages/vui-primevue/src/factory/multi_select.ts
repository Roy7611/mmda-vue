import { h } from "vue";
import MultiSelect from "primevue/multiselect";
import type { UiMultiSelectProps } from "@mmda/vui";
import {
  applyAndEmitMultiSelectKeys,
  htmlAttributesOf,
  multiSelectChromeOptionsOf,
  multiSelectModifierClasses,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectSelectedKeysOf,
  withMultiSelectBindMode,
} from "@mmda/vui";

function optionsOf(props: UiMultiSelectProps) {
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
    display,
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

  return h(MultiSelect, {
    ...rest,
    ...htmlAttributesOf(props),
    options: optionsOf(props),
    optionLabel: "label",
    optionValue: "value",
    modelValue: multiSelectSelectedKeysOf(props),
    placeholder,
    disabled,
    filter: allowFiltering !== false,
    display: display === "text" ? "comma" : "chip",
    class: [...multiSelectModifierClasses(props)].flat(),
    "onUpdate:modelValue": (next: unknown) => {
      applyAndEmitMultiSelectKeys(
        props,
        Array.isArray(next) ? next : [],
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

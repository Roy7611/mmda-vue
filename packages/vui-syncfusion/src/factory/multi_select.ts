import { h } from "vue";
import { MultiSelectComponent } from "@syncfusion/ej2-vue-dropdowns";
import type { UiMultiSelectProps } from "@mmda/core"
import { SELECT_DEBOUNCE_MS, applyAndEmitMultiSelectKeys, multiSelectChromeOptionsOf, multiSelectModifierClasses, multiSelectOptionKeyOf, multiSelectOptionLabelOf, multiSelectSelectedKeysOf, withMultiSelectBindMode } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

function dataSourceOf(props: UiMultiSelectProps) {
  return multiSelectChromeOptionsOf(props).map((item) => ({
    value: multiSelectOptionKeyOf(item, props),
    label: multiSelectOptionLabelOf(item, props),
  }));
}

function defineInputProps(props: UiMultiSelectProps) {
  const cssClass = multiSelectModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  return {
    ...htmlAttributesOf(props),
    cssClass,
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
  };
}

export function createMultiSelect(props: UiMultiSelectProps) {
  const ej2Props = {
    ...defineInputProps(props),
    dataSource: dataSourceOf(props),
    fields: { value: "value", text: "label" },
    value: multiSelectSelectedKeysOf(props),
    mode: "CheckBox" as const,
    showSelectAll: true,
    allowFiltering: props.allowFiltering !== false,
    debounceDelay: SELECT_DEBOUNCE_MS,
    change: (args: { value?: Array<string | number> }) => {
      applyAndEmitMultiSelectKeys(
        props,
        Array.isArray(args?.value) ? args.value : [],
      );
    },
  };

  return h(MultiSelectComponent, ej2Props);
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

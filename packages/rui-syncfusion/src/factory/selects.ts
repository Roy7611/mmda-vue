import { createElement, type ReactElement } from "react";
import {
  AutoCompleteComponent,
  ComboBoxComponent,
  DropDownListComponent,
  DropDownTreeComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-react-dropdowns";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_MIN_LENGTH,
  AUTOCOMPLETE_SUGGESTION_COUNT,
  SELECT_DEBOUNCE_MS,
  SELECT_MIN_LENGTH,
  applyMultiSelectSelection,
  autoCompleteModifierClasses,
  comboBoxAllowCustom,
  comboBoxModifierClasses,
  comboBoxValueOf,
  dropDownListModifierClasses,
  dropDownListValueOf,
  multiSelectChromeOptionsOf,
  multiSelectModifierClasses,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectSelectedKeysOf,
  resolveMultiSelectItems,
  selectOptionsGrouped,
  selectOptionsOf,
  tagAutoCompleteItemsOf,
  tagAutoCompleteModifierClasses,
  tagAutoCompleteTextOf,
  withMultiSelectBindMode,
  type UiAutoCompleteProps,
  type UiComboBoxProps,
  type UiDropDownListProps,
  type UiMultiSelectProps,
  type UiSelectOption,
  type UiSelectSuggest,
  type UiTagAutoCompleteProps,
  type UiTreeSelectProps,
} from "@mmda/core";
import { sfCssClass, sfHtmlAttributes } from "./utils";

function selectFields(options: UiSelectOption[]): Record<string, string> {
  const fields: Record<string, string> = { value: "value", text: "label" };
  if (selectOptionsGrouped(options)) fields.groupBy = "group";
  return fields;
}

function filteringHandler(
  suggest: UiSelectSuggest | undefined,
  minLength: number,
  allowFiltering: boolean,
): ((args: any) => void) | undefined {
  if (!suggest || allowFiltering === false) return undefined;
  return (args: any) => {
    args.preventDefaultAction = true;
    const query = String(args?.text ?? "");
    if (query.length < minLength) {
      args.updateData?.([]);
      return;
    }
    void Promise.resolve(suggest(query)).then((rows) => {
      args.updateData?.(
        (rows ?? []).map((item) =>
          typeof item === "string" ? { value: item, label: item } : item,
        ),
      );
    });
  };
}

export function createDropDownList(props: UiDropDownListProps): ReactElement {
  const options = selectOptionsOf(props);
  return createElement(DropDownListComponent as any, {
    value: dropDownListValueOf(props) ?? null,
    dataSource: options,
    fields: selectFields(options),
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    allowFiltering: props.allowFiltering !== false,
    debounceDelay: props.debounceDelay ?? SELECT_DEBOUNCE_MS,
    cssClass: sfCssClass(props, dropDownListModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    filtering: filteringHandler(
      props.suggest,
      props.minLength ?? SELECT_MIN_LENGTH,
      props.allowFiltering !== false,
    ),
    change: (args: { value?: string | number | null }) =>
      props.onChange?.(args?.value ?? null),
  });
}

export function createComboBox(props: UiComboBoxProps): ReactElement {
  const options = selectOptionsOf(props);
  return createElement(ComboBoxComponent as any, {
    value: comboBoxValueOf(props) ?? null,
    dataSource: options,
    fields: selectFields(options),
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    allowFiltering: props.allowFiltering !== false,
    allowCustom: comboBoxAllowCustom(props),
    debounceDelay: props.debounceDelay ?? SELECT_DEBOUNCE_MS,
    cssClass: sfCssClass(props, comboBoxModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    filtering: filteringHandler(
      props.suggest,
      props.minLength ?? SELECT_MIN_LENGTH,
      props.allowFiltering !== false,
    ),
    change: (args: { value?: string | number | null }) =>
      props.onChange?.(args?.value ?? null),
  });
}

export function createMultiSelect(props: UiMultiSelectProps): ReactElement {
  const options = multiSelectChromeOptionsOf(props).map((item) => ({
    value: multiSelectOptionKeyOf(item, props),
    label: multiSelectOptionLabelOf(item, props),
  }));

  return createElement(MultiSelectComponent as any, {
    dataSource: options,
    fields: { value: "value", text: "label" },
    value: multiSelectSelectedKeysOf(props),
    mode: "CheckBox",
    showSelectAll: true,
    allowFiltering: props.allowFiltering !== false,
    debounceDelay: SELECT_DEBOUNCE_MS,
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    cssClass: sfCssClass(props, multiSelectModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { value?: Array<string | number> }) => {
      const keys = Array.isArray(args?.value) ? args.value : [];
      const bound = applyMultiSelectSelection(
        props,
        resolveMultiSelectItems(keys, props),
      );
      props.onChange?.(bound);
    },
  });
}

export function createMultiItemSelect(props: UiMultiSelectProps): ReactElement {
  return createMultiSelect(withMultiSelectBindMode(props, "item_array"));
}

export function createMultiValueSelect(
  props: UiMultiSelectProps,
): ReactElement {
  return createMultiSelect(withMultiSelectBindMode(props, "value_array"));
}

export function createMultiTextSelect(props: UiMultiSelectProps): ReactElement {
  return createMultiSelect(withMultiSelectBindMode(props, "join_text"));
}

export function createMultiBitSelect(props: UiMultiSelectProps): ReactElement {
  return createMultiSelect(withMultiSelectBindMode(props, "or_bits"));
}

export function createAutoComplete(props: UiAutoCompleteProps): ReactElement {
  const options = selectOptionsOf(props);
  return createElement(AutoCompleteComponent as any, {
    value: props.value ?? "",
    dataSource: options,
    fields: { value: "value", text: "label" },
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    highlight: props.highlight === true,
    minLength: props.minLength ?? AUTOCOMPLETE_MIN_LENGTH,
    debounceDelay: props.debounceDelay ?? AUTOCOMPLETE_DEBOUNCE_MS,
    suggestionCount: props.suggestionCount ?? AUTOCOMPLETE_SUGGESTION_COUNT,
    cssClass: sfCssClass(props, autoCompleteModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    filtering: filteringHandler(
      props.suggest,
      props.minLength ?? AUTOCOMPLETE_MIN_LENGTH,
      true,
    ),
    change: (args: { value?: string }) =>
      props.onChange?.(String(args?.value ?? "")),
  });
}

export function createTagAutoComplete(
  props: UiTagAutoCompleteProps,
): ReactElement {
  const options = selectOptionsOf(props);
  const tags = tagAutoCompleteItemsOf(props.value, props);
  return createElement(MultiSelectComponent as any, {
    dataSource: options,
    fields: { value: "value", text: "label" },
    value: tags,
    mode: "Box",
    allowCustom: true,
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    minLength: props.minLength ?? AUTOCOMPLETE_MIN_LENGTH,
    debounceDelay: props.debounceDelay ?? AUTOCOMPLETE_DEBOUNCE_MS,
    cssClass: sfCssClass(props, tagAutoCompleteModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    filtering: filteringHandler(
      props.suggest,
      props.minLength ?? AUTOCOMPLETE_MIN_LENGTH,
      true,
    ),
    change: (args: { value?: Array<string> }) =>
      props.onChange?.(
        tagAutoCompleteTextOf(
          Array.isArray(args?.value) ? args.value : [],
          props,
        ),
      ),
  });
}

function treeFields(
  fields?: UiTreeSelectProps["fields"],
): Record<string, string> {
  return {
    dataSource: fields?.children ?? "children",
    value: fields?.id ?? "id",
    text: typeof fields?.label === "string" ? fields.label : "label",
    parentValue: fields?.parentId ?? "parentId",
    hasChildren: fields?.childrenCount ? "hasChildren" : undefined,
  } as Record<string, string>;
}

export function createTreeSelect(
  props: UiTreeSelectProps<any, ReactElement>,
): ReactElement {
  const multiple = props.selectionMode === "checkbox";
  const value = props.value;
  return createElement(DropDownTreeComponent as any, {
    dataSource: props.data ?? [],
    fields: treeFields(props.fields),
    value: Array.isArray(value) ? value : value == null ? [] : [value],
    mode: multiple
      ? "CheckBox"
      : props.selectedDisplay === "chips"
        ? "Box"
        : "Default",
    placeholder: props.placeholder,
    enabled: props.disabled !== true,
    showClearButton: props.showClear !== false,
    showCheckBox: multiple,
    allowFiltering: props.allowFiltering !== false,
    popupHeight: props.popupHeight,
    popupWidth: props.popupWidth,
    cssClass: sfCssClass(props, props.class),
    htmlAttributes: sfHtmlAttributes(props),
    change: (args: { value?: Array<string | number> }) => {
      const next = args?.value ?? [];
      props.onChange?.(multiple ? next : (next[0] ?? null));
    },
  });
}

import { h, type VNode } from "vue";
import { MetaModel, type MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import {
  CheckBoxComponent,
  SwitchComponent,
} from "@syncfusion/ej2-vue-buttons";
import {
  DropDownListComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-vue-dropdowns";
import { fallbackDisplay } from "./display";
import {
  control,
  invalidOf,
  referenceDataSource,
  referenceFieldKeys,
  referenceSelectedValue,
  resolveReferenceOption,
  update,
  type UiContext,
} from "./utils";

export const dropdown = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const reference = field.reference;
  if (!reference) {
    return control(DropDownListComponent as any, field, context, props, {
      dataSource: props?.options ?? [],
      fields: props?.fields,
      allowFiltering: true,
      showClearButton: field.nullable,
    });
  }

  const { valueKey, textKey } = referenceFieldKeys(reference);
  const dataSource = referenceDataSource(reference, props?.options);

  return control(
    DropDownListComponent as any,
    field,
    context,
    {
      ...props,
      change: (args: any) => {
        update(
          field,
          context,
        )(resolveReferenceOption(reference, args?.value, args?.itemData));
      },
    },
    {
      dataSource,
      fields: { text: textKey, value: valueKey },
      value: referenceSelectedValue(field, context, reference),
      allowFiltering: true,
      showClearButton: field.nullable,
    },
  );
};

export const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const reference = field.reference;
  if (!reference) {
    return control(MultiSelectComponent as any, field, context, props, {
      dataSource: props?.options ?? [],
      mode: "CheckBox",
    });
  }

  const { valueKey, textKey } = referenceFieldKeys(reference);
  const dataSource = referenceDataSource(reference, props?.options);
  const current = context.getFieldValue(field);
  const selected = Array.isArray(current)
    ? current
        .map((item) =>
          item != null && typeof item === "object"
            ? reference.valueOf(item)
            : item,
        )
        .filter((value) => value !== 0 && value !== "0")
    : current;

  return control(
    MultiSelectComponent as any,
    field,
    context,
    {
      ...props,
      change: (args: any) => {
        const values = Array.isArray(args?.value) ? args.value : [];
        update(
          field,
          context,
        )(
          values.map((value: unknown) =>
            resolveReferenceOption(reference, value),
          ),
        );
      },
    },
    {
      dataSource,
      fields: { text: textKey, value: valueKey },
      value: selected,
      mode: "CheckBox",
    },
  );
};

export const checkbox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(CheckBoxComponent as any, field, context, props, {
    checked: context.getFieldValue(field),
    label: field.displayLabel,
  });

export const switcher = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(SwitchComponent as any, field, context, props, {
    checked: context.getFieldValue(field),
  });

/**
 * HAS_ONE / 远程 REF：对齐老 SearchBox = 可编辑 ComboBox 联想 + 搜索按钮弹窗。
 */
export const searchBox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  const reference = field.reference;
  if (!reference) {
    return h("span", { class: "warning" }, "不是引用字段");
  }
  const builder = context.uiBuilder;
  if (!builder?.buildSearchForRelative) {
    return fallbackDisplay(field, context, props);
  }

  const valueKey = reference.refFlds?.[0] ?? "value";
  const labelKey = reference.refFlds?.[1] ?? valueKey;
  const fldOptions = context.getFieldOptions(field);
  const searchOptions = context.getSearchForRelativeOptions(field);

  let fieldValue = (context.model as Record<string, unknown>)[field.fieldName]
    ? context.getFieldValue(field)
    : null;
  if (
    fieldValue &&
    typeof fieldValue === "object" &&
    (fieldValue as Record<string, unknown>)[valueKey] == 0
  ) {
    fieldValue = null;
  }

  if (fieldValue && typeof fieldValue === "object") {
    const key = reference.valueOf(fieldValue);
    if (
      !fldOptions.selectOptions.some((item) => reference.valueOf(item) === key)
    ) {
      fldOptions.selectOptions.unshift(fieldValue);
    }
    searchOptions.searchWord = fieldValue;
  }

  const selectedModel =
    searchOptions.searchWord != null &&
    typeof searchOptions.searchWord === "object"
      ? searchOptions.searchWord
      : fieldValue;

  return builder.buildSearchForRelative(context, field, {
    ...props,
    modelValue: selectedModel,
    showClear: Boolean(selectedModel),
    options: fldOptions.selectOptions,
    title: props?.title ?? field.displayLabel,
    dataKey: valueKey,
    optionLabel: labelKey,
    valueField: valueKey,
    labelField: labelKey,
    invalid: invalidOf(field, context),
    onChange: (value: any) => {
      searchOptions.searchWord = value || null;
      context.setFieldValue(field, value || null);
      if (!value) {
        const model = context.model as Record<string, any>;
        MetaModel.setRefProp(model, field.fieldName, null);
        reference.refFlds.forEach((rf, index) => {
          if (index > 0) MetaModel.delCustomProp(model, rf);
        });
        if (reference.hasOne && reference.alias) {
          model[reference.alias] = null;
        }
      }
    },
    toSearch: async () => {
      const picked = await (context as any).pickRelative?.(field);
      if (picked) searchOptions.searchWord = picked;
      return true;
    },
  });
};

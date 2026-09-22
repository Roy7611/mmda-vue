import { h, type VNode } from "vue";
import { MetaModel, type MetaUiField } from "@mmda/core";
import type { UiProps } from "@mmda/vui"
import { autoCompleteBindValue, autoCompletePropsFromField, bitCheckBoxListPropsFromField, checkBoxListPropsFromField, checkBoxPropsFromField, switchPropsFromField, comboBoxPropsFromField, dropDownListPropsFromField, radioButtonGroupPropsFromField, multiBitSelectPropsFromField, multiItemSelectPropsFromField, multiSelectPropsFromField, multiTextSelectPropsFromField, multiValueSelectPropsFromField, tagAutoCompletePropsFromField, routeAutoCompleteField } from "@mmda/core"
import { treeSelectPropsFromField } from "@mmda/vui"
import { createAutoComplete } from "../factory/autocomplete";
import { createCheckBox } from "../factory/checkbox";
import { createSwitch } from "../factory/switch";
import { createBitCheckBoxList, createCheckBoxList } from "../factory/check_box_list";
import { createComboBox } from "../factory/combo_box";
import { createDropDownList } from "../factory/drop_down_list";
import { createRadioButtonGroup } from "../factory/radio_button_group";
import {
  createMultiBitSelect,
  createMultiItemSelect,
  createMultiSelect,
  createMultiTextSelect,
  createMultiValueSelect,
} from "../factory/multi_select";
import { createTagAutoComplete } from "../factory/tag_auto_complete";
import { createTreeSelect } from "../factory/tree_select";
import { createSearchRelative } from "../factory/search_relative";
import {
  control,
  invalidOf,
  update,
  type SfVuiContext,
} from "./utils";

export const dropDownList = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createDropDownList(
      dropDownListPropsFromField(field, context),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

export const treeSelect = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createTreeSelect(
      treeSelectPropsFromField(field, context),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

export const comboBox = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createComboBox(comboBoxPropsFromField(field, context)),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

function wrapSf(field: MetaUiField, context: SfVuiContext, child: VNode) {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    child,
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
}

export const radioButtonGroup = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createRadioButtonGroup(
      radioButtonGroupPropsFromField(field, context),
    ),
  );

export const multiSelect = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createMultiSelect(
      multiSelectPropsFromField(field, context),
    ),
  );

export const multiItemSelect = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createMultiItemSelect(
      multiItemSelectPropsFromField(field, context),
    ),
  );

export const multiValueSelect = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createMultiValueSelect(
      multiValueSelectPropsFromField(field, context),
    ),
  );

export const multiTextSelect = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createMultiTextSelect(
      multiTextSelectPropsFromField(field, context),
    ),
  );

export const multiBitSelect = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createMultiBitSelect(
      multiBitSelectPropsFromField(field, context),
    ),
  );

export const checkBoxList = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createCheckBoxList(
      checkBoxListPropsFromField(field, context),
    ),
  );

export const bitCheckBoxList = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) =>
  wrapSf(
    field,
    context,
    createBitCheckBoxList(
      bitCheckBoxListPropsFromField(field, context),
    ),
  );

export const tagAutoComplete = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => {
  return wrapSf(
    field,
    context,
    createTagAutoComplete(tagAutoCompletePropsFromField(
      field,
      context,
      props ?? {},
    )),
  );
};

export const checkbox = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createCheckBox(checkBoxPropsFromField(field, context)),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

export const switchControl = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createSwitch(switchPropsFromField(field, context)),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

export const switcher = switchControl;

/**
 * HAS_ONE / 远程 REF：对齐老 SearchBox = 可编辑 ComboBox 联想 + 搜索按钮弹窗。
 */
export const searchBox = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
): VNode => {
  const reference = field.reference;
  if (!reference) {
    return h("span", { class: "warning" }, "不是引用字段");
  }

  const valueKey = reference.refFlds?.[0] ?? "value";
  const labelKey = reference.refFlds?.[1] ?? valueKey;
  const fldOptions = context.getFieldSearchOptions(field);

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
    fldOptions.currentSelectOption = fieldValue;
  }

  const selectedModel =
    fldOptions.currentSelectOption != null &&
    typeof fldOptions.currentSelectOption === "object"
      ? fldOptions.currentSelectOption
      : fieldValue;

  return createSearchRelative(field, context, {
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
      fldOptions.currentSelectOption = value || null;
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
      const picked = await context.select(field);
      if (picked) fldOptions.currentSelectOption = picked;
      return true;
    },
  });
};

export const autoComplete = (
  field: MetaUiField,
  context: SfVuiContext,
  props?: UiProps,
): VNode => {
  const route = routeAutoCompleteField(field);
  if (route === "dropDownList") return dropDownList(field, context);
  if (route === "searchBox") return searchBox(field, context);
  const invalid = invalidOf(field, context);
  const reference = field.reference?.isRef ? field.reference : undefined;
  return h("div", { class: ["mmda-control", invalid && "is-invalid"] }, [
    createAutoComplete({
      value: autoCompleteBindValue(context.getFieldValue(field), { reference }),
      ...autoCompletePropsFromField(field, props ?? {}),
      disabled: context.isFieldReadonly(field),
      onUpdate: update(field, context),
    }),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        context.getInvalidMessage?.(field),
      ),
  ]);
};

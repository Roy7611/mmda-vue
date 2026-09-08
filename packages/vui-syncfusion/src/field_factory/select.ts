import { h, type VNode } from "vue";
import { MetaModel, type MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import {
  autoCompleteBindValue,
  autoCompletePropsFromField,
  bitCheckBoxListPropsFromField,
  checkBoxListPropsFromField,
  checkBoxPropsFromField,
  switchPropsFromField,
  comboBoxPropsFromField,
  dropDownListPropsFromField,
  radioButtonGroupPropsFromField,
  treeSelectPropsFromField,
  multiBitSelectPropsFromField,
  multiItemSelectPropsFromField,
  multiSelectPropsFromField,
  multiTextSelectPropsFromField,
  multiValueSelectPropsFromField,
  tagAutoCompletePropsFromField,
  routeAutoCompleteField,
} from "@mmda/vui";
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
import { fallbackDisplay } from "./display";
import {
  control,
  invalidOf,
  update,
  type UiContext,
} from "./utils";

export const dropDownList = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createDropDownList(
      dropDownListPropsFromField(field, context, props ?? {}),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const treeSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createTreeSelect(
      treeSelectPropsFromField(field, context, props ?? {}),
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const comboBox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createComboBox(comboBoxPropsFromField(field, context, props ?? {})),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

function wrapSf(field: MetaUiField, context: UiContext, child: VNode) {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    child,
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
}

export const radioButtonGroup = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createRadioButtonGroup(
      radioButtonGroupPropsFromField(field, context, props ?? {}),
    ),
  );

export const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createMultiSelect(
      multiSelectPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const multiItemSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createMultiItemSelect(
      multiItemSelectPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const multiValueSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createMultiValueSelect(
      multiValueSelectPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const multiTextSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createMultiTextSelect(
      multiTextSelectPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const multiBitSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createMultiBitSelect(
      multiBitSelectPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const checkBoxList = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createCheckBoxList(
      checkBoxListPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const bitCheckBoxList = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  wrapSf(
    field,
    context,
    createBitCheckBoxList(
      bitCheckBoxListPropsFromField(field, context as any, props ?? {}),
    ),
  );

export const tagAutoComplete = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const mapped = tagAutoCompletePropsFromField(
    field,
    context as any,
    props ?? {},
  );
  return wrapSf(
    field,
    context,
    createTagAutoComplete(mapped.value, mapped.props),
  );
};

export const checkbox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createCheckBox(checkBoxPropsFromField(field, context, props ?? {})),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const switchControl = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const invalid = invalidOf(field, context);
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createSwitch(switchPropsFromField(field, context, props ?? {})),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const switcher = switchControl;

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
  const builder = context.app?.ui;
  if (!builder?.buildSearchForRelative) {
    return fallbackDisplay(field, context, props);
  }

  const valueKey = reference.refFlds?.[0] ?? "value";
  const labelKey = reference.refFlds?.[1] ?? valueKey;
  const fldOptions = context.getFieldOptions(field);

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
      const picked = await (context as any).select(field);
      if (picked) fldOptions.currentSelectOption = picked;
      return true;
    },
  });
};

export const autoComplete = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  const route = routeAutoCompleteField(field);
  if (route === "dropDownList") return dropDownList(field, context, props);
  if (route === "searchBox") return searchBox(field, context, props);
  const invalid = invalidOf(field, context);
  const reference = field.reference?.isRef ? field.reference : undefined;
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    createAutoComplete(
      autoCompleteBindValue(context.getFieldValue(field), { reference }),
      {
        ...autoCompletePropsFromField(field, props ?? {}),
        disabled: context.isFieldReadonly(field),
        onUpdate: update(field, context),
      },
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

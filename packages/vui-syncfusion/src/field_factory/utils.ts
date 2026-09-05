import { h, type Component, type VNode } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { PropData, UiViewContext } from "@mmda/vui";
import { getSyncfusionCulture } from "../syncfusion_i18n";

export type UiContext = UiViewContext<any>;

export const update = (field: MetaUiField, context: UiContext) => (value: any) =>
  context.setFieldValue(field, value);

export const invalidOf = (field: MetaUiField, context: UiContext) =>
  Boolean((context as any).isInvalid?.(field));

export const control = (
  component: Component,
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
  extra: PropData = {},
  slots?: Record<string, () => VNode>,
) => {
  const invalid = invalidOf(field, context);
  const {
    onChange: onChangeProp,
    change: changeProp,
    input: inputProp,
    ...restProps
  } = props;
  const onChange = (args: any) => {
    const value = args?.value ?? args?.checked ?? args;
    update(field, context)(value);
    // RoleLogic 等通过 props.onChange 做父子级联
    if (typeof onChangeProp === "function") onChangeProp(value);
  };
  return h("div", { class: ["mmda-sf-control", invalid && "is-invalid"] }, [
    h(
      component,
      {
        id: field.fieldName,
        name: field.fieldName,
        value: context.getFieldValue(field),
        enabled: !context.isFieldReadonly(field),
        readonly: context.isFieldReadonly(field),
        placeholder: field.placeholder,
        locale: getSyncfusionCulture(),
        cssClass: invalid ? "e-error" : undefined,
        ...extra,
        ...restProps,
        change: changeProp ?? onChange,
        input: inputProp ?? onChange,
      },
      slots,
    ),
    invalid &&
      h(
        "span",
        { class: "e-error" },
        (context as any).getInvalidMessage?.(field),
      ),
  ]);
};

export const referenceFieldKeys = (
  reference: NonNullable<MetaUiField["reference"]>,
) => {
  const refFlds = reference.refFlds?.length ? reference.refFlds : ["value", "text"];
  return {
    valueKey: refFlds[0] ?? "value",
    textKey: refFlds[1] ?? refFlds[0] ?? "text",
    refFlds,
  };
};

export const referenceSelectedValue = (
  field: MetaUiField,
  context: UiContext,
  reference: NonNullable<MetaUiField["reference"]>,
) => {
  const current = context.getFieldValue(field);
  if (current == null || current === "") return null;
  const raw =
    typeof current === "object" ? reference.valueOf(current) : current;
  if (raw === 0 || raw === "0") return null;
  return raw;
};

export const resolveReferenceOption = (
  reference: NonNullable<MetaUiField["reference"]>,
  value: unknown,
  itemData?: any,
) => {
  if (value == null || value === "") return null;
  if (
    itemData &&
    typeof itemData === "object" &&
    !("__mmdaOption" in itemData)
  ) {
    return itemData;
  }
  const wrapped = itemData?.__mmdaOption;
  if (wrapped) return wrapped;
  return (
    reference.refOptions.find((option) => reference.valueOf(option) === value) ??
    null
  );
};

export const referenceDataSource = (
  reference: NonNullable<MetaUiField["reference"]>,
  fallback?: unknown[],
) => {
  const options = (reference.refOptions ?? fallback ?? []) as any[];
  const { valueKey, textKey, refFlds } = referenceFieldKeys(reference);
  if (refFlds.length > 2) {
    return options.map((option) => ({
      ...option,
      [valueKey]: reference.valueOf(option),
      [textKey]: String(reference.labelOf(option) ?? ""),
      __mmdaOption: option,
    }));
  }
  return options;
};

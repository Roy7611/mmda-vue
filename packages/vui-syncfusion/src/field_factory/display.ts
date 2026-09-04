import { h, mergeProps } from "vue";
import { MetaModel, type MetaUiField, type Module } from "@mmda/core";
import {
  cleanProps,
  fasIcon,
  TABLE_CELL_PROP_KEYS,
  type PropData,
} from "@mmda/vui";
import { ProgressBarComponent } from "@syncfusion/ej2-vue-progressbar";
import { resolveFieldUnit } from "../factory/utils";
import type { UiContext } from "./utils";

const cellDomProps = (props?: PropData) =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {});

export const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) =>
  h(
    "output",
    { class: "mmda-sf-display", ...props },
    String(context.displayField(field, props.row) ?? ""),
  );

export const tag = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(
    "span",
    { class: "e-badge", ...props },
    context.displayField(field, props?.row),
  );

const tagLabels = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): string[] => {
  const raw = context.getFieldValue(field, props?.row);
  const labelOf = (value: any) =>
    String(
      field.reference?.labelOf?.(value) ??
        value?.label ??
        value?.text ??
        value ??
        "",
    ).trim();
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) return raw.map(labelOf).filter(Boolean);
  if (typeof raw === "number" && field.reference?.refOptions?.length) {
    return field.reference.refOptions
      .filter((item: any) => Number(field.reference!.valueOf(item)) & raw)
      .map(labelOf)
      .filter(Boolean);
  }
  return String(raw)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const tags = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(
    "div",
    { class: "mmda-sf-tags" },
    tagLabels(field, context, props).map((label) =>
      h("span", { class: "e-badge", ...props }, label),
    ),
  );

export const chips = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(
    "div",
    {
      ...props,
      class: ["e-chip-list", "mmda-chips", props?.class],
    },
    tagLabels(field, context, props).map((label) =>
      h("div", { class: "e-chip", tabindex: -1 }, [
        h("span", { class: "e-chip-text" }, label),
      ]),
    ),
  );

export const externalLink = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const app = context.app;
  if (!app) return fallbackDisplay(field, context, props);

  const model = (props?.row ?? context.model) as Record<string, any>;
  const alias = field.reference?.alias;
  const fldVal = model[field.fieldName] ?? (alias ? model[alias] : undefined);
  if (!fldVal) return fallbackDisplay(field, context, props);

  const fldText = MetaModel.displayField(model, field);
  const domProps = cellDomProps(props);
  if (!fldText) {
    return h(
      "span",
      { class: "warning", name: field.fieldName, ...domProps },
      "N/A",
    );
  }

  const linkable = props?.isSearch ? false : (props?.linkable ?? true);
  const reference = field.reference;
  if (!reference) {
    return h("span", { name: field.fieldName, ...domProps }, fldText);
  }

  const { modules = [], context: appContext } = app;
  const systemList: any[] = appContext?.systemList ?? [];
  const api = context.apiClient ?? app.api;
  const isCurrentSystem =
    !reference.refDbName || reference.refDbName === api?.config.service;

  const refMainModule = isCurrentSystem
    ? modules.find((module: Module) =>
        module?.subModules?.some(
          (subModule: Module) => subModule.objName === reference.refObjName,
        ),
      )
    : systemList.find((system: any) => system.service === reference.refDbName);

  const refModule = refMainModule?.subModules?.find(
    (subModule: Module) => subModule.objName === reference.refObjName,
  );

  const readable = isCurrentSystem
    ? Boolean(refModule?.authority?.allowRead)
    : Boolean(refMainModule?.authority?.allowRead);
  if (!linkable || !readable) {
    return h("span", { name: field.fieldName, ...domProps }, fldText);
  }

  const iconProps: PropData = {
    role: "external-link-icon",
    style: {
      marginRight: "5px",
      cursor: "pointer",
    },
    onClick: (event: Event) => {
      event.stopPropagation();
      void (async () => {
        await context.app?.syncAuthState?.();
        const url = context.routeToRelative?.(field, model);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      })();
    },
  };

  return h(
    "div",
    {
      class: "flex_item_center",
      role: "mmda-external-link",
      id: field.fieldName,
      ...domProps,
    },
    [
      fasIcon(
        "external-link",
        mergeProps(iconProps, { class: iconProps.class }),
      ),
      h("span", fldText),
    ],
  );
};

export const fileLink = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const value = context.getFieldValue(field, props?.row);
  return h(
    "a",
    {
      href: value,
      target: "_blank",
      rel: "noopener noreferrer",
      ...cellDomProps(props),
    },
    context.displayField(field, props?.row) || String(value ?? ""),
  );
};

export const boolIcon = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const checked = Boolean(context.getFieldValue(field, props?.row));
  return h("i", {
    ...props,
    class: [
      "e-icons",
      "mmda-bool-icon",
      checked
        ? "e-circle-check mmda-bool-icon--true"
        : "e-circle mmda-bool-icon--false",
      props?.class,
    ],
  });
};

export const progressBar = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(ProgressBarComponent as any, {
    value: Number(context.getFieldValue(field, props?.row) ?? 0),
    ...props,
  });

export const quantityUnit = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const value = context.getFieldValue(field, props?.row);
  const unit = resolveFieldUnit(field);
  const text =
    value == null || value === ""
      ? (field.nullDisplayText ?? "")
      : unit
        ? `${value} ${unit}`
        : String(value);
  return h(
    "span",
    { ...props, class: ["mmda-quantity-unit", props?.class] },
    text,
  );
};

export const percentage = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(
    "span",
    props,
    `${Number(context.getFieldValue(field, props?.row) ?? 0) * 100}%`,
  );

export const multilineText = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h(
    "span",
    { style: { whiteSpace: "pre-wrap" }, ...props },
    context.displayField(field, props?.row),
  );

export const colorBox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h("span", {
    title: String(context.getFieldValue(field, props?.row) ?? ""),
    style: {
      display: "inline-block",
      width: "1.5rem",
      height: "1.5rem",
      backgroundColor: String(
        context.getFieldValue(field, props?.row) ?? "transparent",
      ),
    },
    ...props,
  });

export const fieldImage = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  h("img", {
    src: context.getFieldValue(field, props?.row),
    ...props,
  });

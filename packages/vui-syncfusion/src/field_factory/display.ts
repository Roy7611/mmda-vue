import { h, mergeProps } from "vue";
import { MetaModel, type MetaUiField, type Module, type UiAvatarProps } from "@mmda/core";
import { avatarPropsFromField, progressBarPropsFromField, signaturePadPropsFromField, stepperPropsFromField } from "@mmda/core"
import { cleanProps, fasIcon, chipsPropsFromField, bitChipSetPropsFromField, enumChipSetPropsFromField, timelinePropsFromField, timelineSqlOf, relativeTime, TABLE_CELL_PROP_KEYS, type UiProps } from "@mmda/vui"
import { resolveFieldUnit } from "../factory/utils";
import { createChips } from "../factory/chips";
import { createProgressBar } from "../factory/progress_bar";
import { createSignaturePad } from "../factory/signature_pad";
import { createStepper } from "../factory/stepper";
import { createTimeline } from "../factory/timeline";
import { createAvatar } from "../factory/avatar";
import type { UiContext } from "./utils";

const cellDomProps = (props?: UiProps) =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {});

export const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: UiProps = {},
) =>
  h(
    "output",
    { class: "mmda-display", ...props },
    String(context.displayField(field, props.row) ?? ""),
  );

export const tag = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  h(
    "span",
    { class: "e-badge", ...props },
    context.displayField(field, props?.row),
  );

export const tags = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => createChips(chipsPropsFromField(field, context));

export const chips = tags;

export const bitChipSet = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => createChips(bitChipSetPropsFromField(field, context));

export const enumChipSet = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => createChips(enumChipSetPropsFromField(field, context));

export const externalLink = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const app = context.app;
  if (!app) return fallbackDisplay(field, context);

  const model = (props?.row ?? context.model) as Record<string, any>;
  const alias = field.reference?.alias;
  const fldVal = model[field.fieldName] ?? (alias ? model[alias] : undefined);
  if (!fldVal) return fallbackDisplay(field, context);

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

  const { modules = [] } = app;
  const systemList: Module[] = app.state.systemList ?? [];
  const api = context.logic?.apiClient ?? app.api;
  const isCurrentSystem =
    !reference.refDbName || reference.refDbName === api?.config.service;

  const refMainModule = isCurrentSystem
    ? modules.find((module: Module) =>
        module?.subModules?.some(
          (subModule: Module) => subModule.objName === reference.refObjName,
        ),
      )
    : systemList.find((system) => system.service === reference.refDbName);

  const refModule = refMainModule?.subModules?.find(
    (subModule: Module) => subModule.objName === reference.refObjName,
  );

  const readable = isCurrentSystem
    ? Boolean(refModule?.authority?.allowRead)
    : Boolean(refMainModule?.authority?.allowRead);
  if (!linkable || !readable) {
    return h("span", { name: field.fieldName, ...domProps }, fldText);
  }

  const iconProps: UiProps = {
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
  props?: UiProps,
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
  props?: UiProps,
) => {
  const checked = Boolean(context.getFieldValue(field, props?.row));
  return h("i", {
    ...props,
    class: [
      "mmda-bool-icon",
      checked
        ? "fas fa-check-circle mmda-bool-icon--true"
        : "e-icons e-circle mmda-bool-icon--false",
      props?.class,
    ],
  });
};

export const progressBar = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => createProgressBar(progressBarPropsFromField(field, context));

export const signaturePad = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => createSignaturePad(signaturePadPropsFromField(field, context));

export const stepper = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => createStepper(stepperPropsFromField(field, context));

export const timeline = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const render =
    context.uiBuilder?.factory?.timeline ?? createTimeline;
  return render(timelinePropsFromField(field, context));
};

export const relativeTimeField = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  relativeTime(
    timelineSqlOf(context.getFieldValue(field, props?.row)) ?? "",
    { locale: context.locale },
  );

export const quantityUnit = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
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
  props?: UiProps,
) =>
  h(
    "span",
    props,
    `${Number(context.getFieldValue(field, props?.row) ?? 0) * 100}%`,
  );

export const multilineText = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  h(
    "span",
    { style: { whiteSpace: "pre-wrap" }, ...props },
    context.displayField(field, props?.row),
  );

export const colorBox = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
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
  props?: UiProps,
) =>
  h("img", {
    src: context.getFieldValue(field, props?.row),
    ...props,
  });

export const fieldAvatar = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  // 表格单元格里的头像默认 small（表单里不默认，交给字段/调用方）
  const cell = props as UiAvatarProps | undefined;
  const avatarProps: UiAvatarProps = {
    ...avatarPropsFromField(field, context),
    ...(cell ? { size: cell.size ?? 'small' } : {}),
  };
  const render = (context as any).uiBuilder?.factory?.avatar;
  if (render) return render(avatarProps);
  return createAvatar(avatarProps, (name: string) =>
    context.uiBuilder?.factory?.resolveIcon?.(name) ?? name,
  );
};

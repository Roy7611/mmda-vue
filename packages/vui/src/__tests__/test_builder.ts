import {
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import { SqlDataType, type MetaUi, type MetaUiField } from "@mmda/core";
import { VueUiBuilder } from "../ui/builder/builder";
import type { VueUiContext } from "../contexts/vue_ui_context";
import type { SigninFormProps, SigninFormSlots, SignupFormProps } from "../ui/factory/auth";
import type {
  AppSideBarProps,
  AppTopBarProps,
  ModuleBreadcrumbProps,
  ModuleSearchbarProps,
  ModuleToolbarProps,
} from "../app/app";
import type { UiFactory, UiFieldFactory } from "../ui/factory/factory";
import type { PropData, UiLayout, UiSlots } from "../ui/layout/layout";
import type { UiListPropsType } from "../ui/factory/list";
import { bindListDisplayRenderers } from "../ui/factory/list";
import type { UiSplitterPane, UiSplitterProps } from "../ui/factory/splitter";
import { treeIdOf, treeLabelOf, treeModifierClasses, type UiTreePropsType } from "../ui/factory/tree";
import { paintModuleToolbar, defaultToolbarMoreActions } from "../ui/builder/module_toolbar";

type UiContext = VueUiContext<any>;

const stub = (name: string, extra?: PropData): VNode =>
  h("span", { class: "mmda-html-stub", "data-unimplemented": name, ...extra }, "not implemented");

const testLayout: UiLayout = {
  fieldLayout: "vertical",
  fieldMessage: true,
  wrapManyGroup: true,
  maxCols: 12,
  cell: (child, nCol = 1) =>
    h("div", { class: "mmda-cell", style: { gridColumn: `span ${nCol}` } }, child as any),
  row: (children, nCols, props = {}) =>
    h(
      "div",
      {
        class: "mmda-row",
        style: {
          display: "grid",
          gridTemplateColumns: nCols.map((n) => `${n}fr`).join(" "),
          gap: "0.75rem",
        },
        ...props,
      },
      children,
    ),
  column: (children, props = {}) =>
    h(
      "div",
      {
        class: "mmda-column",
        style: { display: "flex", flexDirection: "column", gap: "0.75rem" },
        ...props,
      },
      children,
    ),
  grid: (children, _nCols, props = {}) =>
    h("div", { class: "mmda-grid", ...props }, children),
  listTile: (slots) =>
    h("div", { class: "mmda-list-tile" }, [
      slots.leading?.(),
      h("div", [slots.title(), slots.subtitle?.()]),
      slots.trailing?.(),
    ]),
};

const listedFields = (metaUi: MetaUi) => {
  const listed = metaUi.getListedFields();
  return listed.length
    ? listed
    : metaUi.groups.filter((g) => !g.many).flatMap((g) => g.fields);
};

function createTestUiFactory(layout: UiLayout = testLayout): UiFactory {
  const button = (props: any, slots?: any) =>
    h(
      "button",
      {
        id: props.id,
        type: props.type ?? "button",
        title: props.tooltip,
        "aria-label": props["aria-label"] ?? props.tooltip,
        disabled: props.disabled === true || props.loading,
        class: ["mmda-button", props.colorRole && `is-${props.colorRole}`, props.class]
          .filter(Boolean)
          .join(" "),
        onClick: props.onClick ?? props.onAction ?? props.command,
      },
      slots?.default?.() ?? [
        props.icon && h("span", { class: ["mmda-icon", props.icon] }),
        props.label || null,
      ],
    );

  const table = <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaUi);
    const detail = props.rowDetail;
    return h("table", { class: "mmda-table" }, [
      h("thead", [h("tr", fields.map((field) => h("th", field.displayLabel)))]),
      h(
        "tbody",
        model.length
          ? model.flatMap((row: any, index) => {
              const dataRow = h(
                "tr",
                {
                  key: props.itemKey?.(row) ?? row.id ?? index,
                  onClick: () => props.onItemClick?.(row),
                  onDblclick: () => props.onItemDoubleClick?.(row),
                },
                fields.map((field) =>
                  h(
                    "td",
                    props.renderCell
                      ? [props.renderCell(field, row, props)]
                      : String(row[field.fieldName] ?? ""),
                  ),
                ),
              );
              if (!detail) return [dataRow];
              return [
                dataRow,
                h("tr", { key: `detail-${props.itemKey?.(row) ?? row.id ?? index}` }, [
                  h(
                    "td",
                    { colspan: Math.max(fields.length, 1) },
                    [detail.detail(row) as any],
                  ),
                ]),
              ];
            })
          : [h("tr", [h("td", { colspan: Math.max(fields.length, 1) }, "No data")])],
      ),
    ]);
  };

  const factory = {
    layout,
    actionIcons: {},
    viewIcons: {},
    dialogIcons: {},
    resolveIcon: (icon) => icon,
    textSpan: (text, props) => h("span", props, text),
    label: (text, props) => h("label", props, text),
    image: (src, props) => h("img", { src, ...props }),
    icon: (icon, props) => h("span", { class: ["mmda-icon", icon], ...props }),
    badge: ({ value, class: className, shape, overlay, position, colorRole, ...props }) =>
      h(
        "span",
        {
          ...props,
          "data-color-role": colorRole,
          "data-shape": shape,
          "data-overlay": overlay,
          "data-position": position,
          class: ["mmda-badge", className],
        },
        value == null ? undefined : String(value),
      ),
    avatar: ({ src, icon, label, class: className, shape, size, colorRole, ...props }) =>
      h(
        "span",
        {
          ...props,
          "data-src": src,
          "data-icon": icon,
          "data-color-role": colorRole,
          "data-shape": shape,
          "data-size": size,
          class: ["mmda-avatar", className],
        },
        label ?? src ?? icon,
      ),
    card: (props, slots) =>
      h(
        "article",
        {
          class: ["mmda-card", props.class],
          "data-surface": props.surface,
          "data-color-role": props.colorRole,
          "data-image": props.image,
          "data-header-image": props.headerImage,
          "data-divider": props.divider,
        },
        [
          slots?.image?.() ??
            (props.image
              ? h("img", { src: props.image, alt: props.imageAlt })
              : null),
          slots?.header?.() ??
            (props.title ? h("header", props.title) : null),
          props.divider ? h("hr", { class: "mmda-divider" }) : null,
          slots?.default?.(),
          slots?.footer?.(),
        ],
      ),
    divider: (props = {}) =>
      h("hr", {
        class: ["mmda-divider", props.class],
        "data-orientation": props.orientation,
      }, props.label),
    tooltip: (props: any = {}, slots?: any) =>
      h(
        "span",
        {
          class: [
            "mmda-tooltip",
            `mmda-tooltip--${props.position ?? "top"}`,
            props.disabled ? "mmda-tooltip--disabled" : undefined,
            props.class,
          ],
          "data-content": props.content,
          "data-opens-on": props.opensOn ?? "auto",
          title: props.disabled ? undefined : props.content,
        },
        slots?.default?.() ?? slots?.content?.(),
      ),
    inplaceEditor: (props: any = {}, slots?: any) =>
      h(
        "div",
        {
          class: [
            "mmda-inplace-editor",
            props.active ? "mmda-inplace-editor--open" : undefined,
            props.disabled ? "mmda-inplace-editor--disabled" : undefined,
            props.class,
          ],
        },
        props.disabled || !props.active
          ? slots?.display?.()
          : slots?.content?.(),
      ),
    fileLink: (props: any = {}) =>
      h(
        "a",
        {
          class: "mmda-file-link",
          href: props.downloadable === false ? undefined : props.url,
        },
        props.fileName ?? props.url,
      ),
    fileUploader: (props: any = {}) =>
      h("div", {
        class: "mmda-file-uploader",
      }),
    filesUploader: (props: any = {}) =>
      h("div", { class: "mmda-files-uploader", ...props }),
    imageUploader: (props: any = {}) =>
      h("div", { class: "mmda-image-uploader", ...props }),
    imagesUploader: (props: any = {}) =>
      h("div", { class: "mmda-images-uploader", ...props }),
    barcode: ({ value, class: className, format, displayText, ...props }) =>
      h(
        "span",
        {
          ...props,
          "data-format": format,
          class: ["mmda-barcode", className],
        },
        typeof displayText === "function" ? displayText(value) : (displayText ?? value),
      ),
    qrCode: ({ value, class: className, format, displayText, ...props }) =>
      h(
        "span",
        {
          ...props,
          "data-format": format,
          class: ["mmda-qrcode", className],
        },
        typeof displayText === "function" ? displayText(value) : (displayText ?? value),
      ),
    breadcrumb: ({ items, class: className, separator, ...props }) =>
      h(
        "nav",
        { ...props, class: ["mmda-breadcrumb", className], "data-separator": separator },
        (items ?? []).map((item: any) =>
          h("span", { key: item.key ?? item.label, "data-to": item.to }, item.label),
        ),
      ),
    calendar: ({
      value,
      selectionMode,
      class: className,
      min,
      max,
      locale,
      ...props
    }) =>
      h("div", {
        ...props,
        class: ["mmda-calendar", selectionMode === "multiple" ? "mmda-calendar--multiple" : undefined, className],
        "data-mode": selectionMode ?? "single",
        "data-min": min,
        "data-max": max,
        "data-locale": locale,
        "data-value": Array.isArray(value)
          ? value.map((d: Date) => d?.toISOString?.() ?? d).join(",")
          : value instanceof Date
            ? value.toISOString()
            : value,
      }),
    carousel: ({
      items,
      selectedIndex,
      autoPlay,
      interval,
      loop,
      animation,
      class: className,
      ...props
    }) =>
      h("div", {
        ...props,
        class: ["mmda-carousel", animation ? `mmda-carousel--${animation}` : undefined, className],
        "data-mode": animation,
        "data-index": selectedIndex,
        "data-autoplay": autoPlay,
        "data-interval": interval,
        "data-loop": loop,
        "data-count": (items ?? []).length,
      }),
    checkBox: (props: any = {}) =>
      h(
        "label",
        {
          ...props,
          class: [
            "mmda-checkbox",
            props.indeterminate === true ? "mmda-checkbox--indeterminate" : undefined,
            props.class,
          ],
          "data-checked": props.checked ?? props.modelValue,
        },
        props.label,
      ),
    switch: (value?: any, props: any = {}) => {
      const merged =
        value != null && typeof value === "object"
          ? { ...value, ...props }
          : { ...props, checked: value };
      return h("button", {
        type: "button",
        role: "switch",
        class: [
          "mmda-switch",
          (merged.checked ?? merged.modelValue)
            ? "mmda-switch--checked"
            : undefined,
          merged.disabled ? "mmda-switch--disabled" : undefined,
          merged.class,
        ],
        "aria-checked": Boolean(merged.checked ?? merged.modelValue),
        disabled: merged.disabled,
        "data-on-label": merged.onLabel,
        "data-off-label": merged.offLabel,
      });
    },
    checkBoxList: (props: any = {}) =>
      h("div", {
        class: ["mmda-checkbox-list", props.class],
        "data-value": String(props.value ?? props.modelValue ?? ""),
      }),
    bitCheckBoxList: (props: any = {}) =>
      factory.checkBoxList({ ...props, bindMode: "or_bits" }),
    colorPicker: (props: any = {}) =>
      h("span", {
        ...props,
        class: [
          "mmda-colorpicker",
          props.mode && props.mode !== "picker"
            ? `mmda-colorpicker--${props.mode}`
            : undefined,
          props.class,
        ],
        "data-value": props.value ?? props.modelValue,
        "data-mode": props.mode,
        "data-mode-switcher": props.showModeSwitcher,
      }),
    maskedTextBox: (props: any = {}) =>
      h("input", {
        class: ["mmda-maskedtextbox", props.class],
        value: props.value ?? props.modelValue,
        placeholder: props.placeholder,
        disabled: props.disabled,
        "data-mask": props.mask,
      }),
    oneTimePasswordInput: (props: any = {}) =>
      h("input", {
        class: ["mmda-otpinput", props.class],
        value: props.value ?? props.modelValue,
        placeholder: props.placeholder,
        disabled: props.disabled,
        "data-length": props.length ?? 4,
        "data-type": props.type ?? "number",
      }),
    queryBuilder: (props: any = {}) =>
      h("div", {
        class: ["mmda-querybuilder", props.class],
        "data-disabled": props.disabled,
      }),
    slider: (props: any = {}) =>
      h("input", {
        class: ["mmda-slider", props.class],
        type: "range",
        min: props.min,
        max: props.max,
        step: props.step,
        disabled: props.disabled,
        "data-type": props.type ?? "Default",
      }),
    rating: (props: any = {}) =>
      h("div", {
        class: ["mmda-rating", props.class],
        "data-items-count": props.itemsCount ?? 5,
        "data-readonly": props.readOnly,
        "data-value": props.value ?? props.modelValue,
      }),
    numberInput: (props: any = {}) =>
      h("input", {
        class: ["mmda-numberinput", props.class],
        type: "number",
        value: props.value ?? props.modelValue,
        min: props.min,
        max: props.max,
        step: props.step,
        disabled: props.disabled,
        "data-format": props.format,
        "data-kind": props.kind,
      }),
    progressBar: (props: any = {}) =>
      h("div", {
        class: [
          "mmda-progressbar",
          props.kind === "circular" ? "mmda-progressbar--circular" : undefined,
          props.size ? `mmda-progressbar--${props.size}` : undefined,
          props.class,
        ],
        "data-value": props.value ?? props.modelValue ?? 0,
        "data-kind": props.kind ?? "linear",
      }),
    signaturePad: (props: any = {}) =>
      h("div", {
        class: [
          "mmda-signature-pad",
          props.readOnly ? "mmda-signature-pad--readonly" : undefined,
          props.disabled ? "mmda-signature-pad--disabled" : undefined,
          props.class,
        ],
        "data-value": props.value ?? props.modelValue ?? "",
      }),
    stepper: (props: any = {}) =>
      h("div", {
        class: [
          "mmda-stepper",
          props.orientation === "vertical"
            ? "mmda-stepper--vertical"
            : "mmda-stepper--horizontal",
          props.class,
        ],
        "data-value": props.value ?? props.modelValue ?? 0,
      }),
    timeline: (props: any = {}) =>
      h("div", {
        class: [
          "mmda-timeline",
          props.orientation === "horizontal"
            ? "mmda-timeline--horizontal"
            : "mmda-timeline--vertical",
          props.class,
        ],
        "data-items": props.items?.length ?? 0,
      }),
    skeleton: (props: any = {}) =>
      h("div", {
        class: [
          "mmda-skeleton",
          `mmda-skeleton--${props.shape ?? "text"}`,
          `mmda-skeleton--${props.shimmer ?? "wave"}`,
          props.class,
        ],
        "data-shape": props.shape ?? "text",
        "data-shimmer": props.shimmer ?? "wave",
        style: {
          width: props.width,
          height: props.height,
        },
      }),
    speechToText: (props: any = {}) =>
      h("button", {
        class: [
          "mmda-speech-to-text",
          props.listening ? "mmda-speech-to-text--listening" : undefined,
          props.disabled ? "mmda-speech-to-text--disabled" : undefined,
          props.class,
        ],
        type: "button",
        disabled: props.disabled,
        "data-lang": props.lang,
        "data-interim": props.interim !== false,
        "data-value": props.value ?? props.modelValue,
      }),
    datePicker: (props: any = {}) =>
      h("span", {
        ...props,
        class: [
          "mmda-datepicker",
          props.precision === "month" ? "mmda-datepicker--month" : undefined,
          props.class,
        ],
        "data-precision": props.precision ?? "day",
        "data-format": props.format,
        "data-allow-input": props.allowInput,
      }),
    monthPicker: (props: any = {}) =>
      factory.datePicker({
        ...props,
        precision: "month",
        format: props.format ?? "yyyy-MM",
      }),
    dateTimePicker: (props: any = {}) =>
      h("span", {
        ...props,
        class: ["mmda-datetimepicker", props.class],
        "data-format": props.format,
        "data-step": props.step,
      }),
    timePicker: (props: any = {}) =>
      h("span", {
        ...props,
        class: ["mmda-timepicker", props.class],
        "data-format": props.format,
        "data-step": props.step,
      }),
    dateRangePicker: (props: any = {}) =>
      h("span", {
        ...props,
        class: ["mmda-daterangepicker", props.class],
        "data-separator": props.separator,
      }),
    chips: (props: any = {}) =>
      h(
        "div",
        {
          ...props,
          class: [
            "mmda-chips",
            props.kind && props.kind !== "action" ? `mmda-chips--${props.kind}` : undefined,
            props.class,
          ],
          "data-kind": props.kind,
        },
        (props.items ?? []).map((item: any) =>
          h("span", { class: "mmda-chip" }, typeof item === "string" ? item : item.label),
        ),
      ),
    contextMenu: (props: any = {}) =>
      h("div", {
        ...props,
        class: ["mmda-context-menu", props.class],
        "data-target": props.target,
        "data-count": (props.items ?? []).length,
      }),
    title: (text, props) => h("h1", props, text),
    subtitle: (text, props) => h("h2", props, text),
    link: (props, slots) =>
      h("a", props, slots?.default?.() ?? props.text ?? String(props.href ?? "")),
    textInput: (props: any = {}) =>
      h("input", {
        class: ["mmda-textinput", props.class],
        value: props.value ?? props.modelValue ?? "",
        "data-value": props.value ?? props.modelValue ?? "",
        placeholder: props.placeholder,
        type: (props.type ?? "Text").toString().toLowerCase(),
        onInput: (event: Event) => {
          const next = (event.target as HTMLInputElement).value;
          props.onChange?.(next);
          props["onUpdate:modelValue"]?.(next);
          props.onUpdate?.(next);
        },
      }),
    textArea: (props: any = {}) =>
      h("textarea", {
        class: ["mmda-textarea", props.class],
        value: props.value ?? props.modelValue ?? "",
        "data-value": props.value ?? props.modelValue ?? "",
        rows: props.rows ?? 3,
        placeholder: props.placeholder,
      }),
    iconField: (value, props) => h("span", props, value),
    dropDownList: (props: any = {}) =>
      h("div", {
        ...props,
        class: ["mmda-dropdown-list", props.class],
        "data-value": props.value ?? props.modelValue,
      }),
    radioButtonGroup: (props: any = {}) =>
      h("div", {
        class: [
          "mmda-radiobuttongroup",
          props.orientation === "vertical"
            ? "mmda-radiobuttongroup--vertical"
            : undefined,
          props.class,
        ],
        "data-value": props.value ?? props.modelValue,
        "data-name": props.name,
      }),
    multiSelect: (props: any = {}) =>
      h("div", {
        class: ["mmda-multi-select", props.class],
        "data-bind": props.bindMode ?? "item_array",
        "data-value": String(props.value ?? props.modelValue ?? ""),
      }),
    multiItemSelect: (props: any = {}) =>
      factory.multiSelect({ ...props, bindMode: "item_array" }),
    multiValueSelect: (props: any = {}) =>
      factory.multiSelect({ ...props, bindMode: "value_array" }),
    multiTextSelect: (props: any = {}) =>
      factory.multiSelect({ ...props, bindMode: "join_text" }),
    multiBitSelect: (props: any = {}) =>
      factory.multiSelect({ ...props, bindMode: "or_bits" }),
    treeSelect: (props: any = {}) =>
      h("div", {
        ...props,
        class: ["mmda-tree-select", props.class],
        "data-value": props.value ?? props.modelValue,
        "data-mode": props.selectionMode,
      }),
    dropDownTree: (props: any = {}) => factory.treeSelect(props),
    comboBox: (props: any = {}) =>
      h("div", {
        ...props,
        class: [
          "mmda-combobox",
          props.allowCustom !== false ? "mmda-combobox--custom" : undefined,
          props.class,
        ],
        "data-value": props.value ?? props.modelValue,
        "data-custom": props.allowCustom,
      }),
    autoComplete: (value, props = {}) =>
      h("input", {
        class: ["mmda-autocomplete", props.class],
        value: props.modelValue ?? value,
        placeholder: props.placeholder,
        ...props.htmlAttributes,
        onInput: (event: Event) => {
          const next = (event.target as HTMLInputElement).value;
          props["onUpdate:modelValue"]?.(next);
          props.onUpdate?.(next);
        },
      }),
    tagAutoComplete: (value, props = {}) =>
      h("div", {
        class: ["mmda-tag-autocomplete", props.class],
        "data-value": props.modelValue ?? value,
      }),
    button,
    buttonGroup: (buttons, props) => h("div", props, buttons()),
    splitButton: (props) => button(props),
    dropDownButton: (buttonProps) => button(buttonProps),
    moreMenuButton: (buttonProps) => button(buttonProps),
    floatingActionButton: (props) => button(props),
    selectButtonGroup: (value, props = {}) =>
      h("div", {
        class: "mmda-select-button-group",
        "data-value": String(props.modelValue ?? value ?? ""),
      }),
    actionButton: (action, _t, _resolve, props) =>
      button({ ...action, ...props, onClick: action.onAction }),
    paginator: () => stub("paginator"),
    list: <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) =>
      h(
        "ul",
        { class: "mmda-list" },
        model.map((item, index) =>
          h(
            "li",
            {
              onClick: () => props.onItemClick?.(item),
              onDblclick: () => props.onItemDoubleClick?.(item),
            },
            (props.item?.(item, index) ??
              String((item as any)[metaUi.labelField ?? metaUi.primaryKey] ?? "")) as any,
          ),
        ),
      ),
    tree: <T>(props: UiTreePropsType<T>) => h(TestTree, props as any),
    table,
    treeGrid: <T>(model: T[], metaUi: MetaUi, props: any) =>
      h("div", {
        class: "mmda-tree-grid",
        "data-tree-shape": props.treeShape,
        "data-shape-key": props.shapeKey,
        "data-load-mode": props.loadMode,
      }, [table(model, metaUi, props)]),
    pagableTable: (loader, metadata, props) =>
      table(loader.model.list as any[], metadata.metaUi, props as any),
    loading: (props: any = {}) =>
      h(
        "div",
        {
          class: ["mmda-loading", props.class],
          "data-size": props.size ?? "medium",
          "data-label": props.label,
        },
        props.label ?? "Loading…",
      ),
    scrollbar: (content, props) =>
      h("div", { style: { overflow: "auto" }, ...props }, content as any),
    menu: () => stub("menu"),
    panelMenu: () => stub("panelMenu"),
    menubar: () => stub("menubar"),
    sidebar: (props: any = {}, slots?: any) =>
      h(
        "aside",
        {
          class: ["mmda-sidebar", props.class],
          "data-open": props.isOpen,
          "data-type": props.type ?? "Auto",
        },
        slots?.default?.(),
      ),
    drawer: (props: any = {}, slots?: any) =>
      h(
        "aside",
        {
          class: ["mmda-sidebar", "mmda-sidebar--drawer", props.class],
          "data-open": props.isOpen ?? props.visible,
        },
        slots?.default?.(),
      ),
    tabs: (props: any = {}) =>
      h("div", {
        class: ["mmda-tabs", props.class],
        "data-value": props.value ?? props.modelValue ?? 0,
        "data-header-placement": props.headerPlacement ?? "Top",
        "data-scrollable": props.scrollable !== false,
      }),
    toolbar: (props: any = {}, slots?: any) =>
      h(
        "div",
        {
          class: ["mmda-test-chrome-toolbar", "mmda-toolbar", props.class],
          "data-layout": props.layout ?? "full",
          "data-align-start": props.align?.start ?? "left",
          "data-align-center": props.align?.center ?? "center",
          "data-align-end": props.align?.end ?? "right",
        },
        [
          h("div", { class: "mmda-toolbar__start" }, slots?.start?.()),
          slots?.center
            ? h("div", { class: "mmda-toolbar__center" }, slots.center())
            : null,
          h("div", { class: "mmda-toolbar__end" }, slots?.end?.()),
        ],
      ),
    splitter: (panes, props) => renderTestSplitter(panes, props),
    searchForRelative: () => stub("searchForRelative"),
    formField: (props: any = {}, slots?: UiSlots) =>
      h("div", { class: ["mmda-form-field", props.class], style: props.style }, [
        props.label
          ? h("label", { class: "mmda-form-field__label" }, String(props.label))
          : null,
        slots?.default?.(),
      ]),
  } as UiFactory;
  bindListDisplayRenderers(factory);
  return factory;
}

function createTestFieldFactory(): UiFieldFactory {
  const fallbackDisplay = (
    field: MetaUiField,
    context: UiContext,
    props: PropData = {},
  ) =>
    h(
      "output",
      { class: "mmda-field-display", ...props },
      String(context.displayField(field, props.row) ?? ""),
    );

  const fallbackInput = (field: MetaUiField, context: UiContext, props = {}) => {
    const value = context.getFieldValue(field);
    const isBool = SqlDataType.isBool(field.dataType);
    const isNumber = SqlDataType.isNum(field.dataType);
    const input = h("input", {
      id: field.fieldName,
      name: field.fieldName,
      type: isBool ? "checkbox" : isNumber ? "number" : "text",
      value: isBool ? undefined : (value ?? ""),
      checked: isBool ? Boolean(value) : undefined,
      disabled: context.isFieldReadonly(field),
      required: context.isFieldRequired(field),
      onInput: (event: Event) => {
        const element = event.target as HTMLInputElement;
        context.setFieldValue(
          field,
          isBool ? element.checked : isNumber ? element.valueAsNumber : element.value,
        );
      },
    });
    return h("div", { class: "mmda-field-input", ...props }, input);
  };

  return { fallbackDisplay, fallbackInput };
}

/** Test-only builder. Not a public vui skin. */
export class TestUiBuilder extends VueUiBuilder {
  constructor(
    factory = createTestUiFactory(),
    fieldFactory = createTestFieldFactory(),
    layout = factory.layout,
  ) {
    super(factory, fieldFactory, layout);
  }

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("div", { class: "mmda-container", ...props }, content);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("header", props, content);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("aside", props, content);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("main", props, content);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("footer", props, content);
  }

  buildAppTopBar(_props: AppTopBarProps = { modules: [], logo: () => null }) {
    return stub("buildAppTopBar", { class: "mmda-app-topbar" });
  }

  buildAppSideBar(_props?: AppSideBarProps) {
    return stub("buildAppSideBar");
  }

  buildAppMenu() {
    return stub("buildAppMenu");
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return this.factory.loading(props);
  }

  buildError(context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-error", ...props }, context.title);
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    const { module, label } = props;
    if (!module) {
      return this.factory.breadcrumb({
        items: [{ label: label || context.title }],
        class: "mmda-test-breadcrumb",
      });
    }
    const chain: any[] = [];
    for (let cur: any = module; cur; cur = cur.parent) chain.unshift(cur);
    const items = chain.map((item, index) => {
      const leaf = index === chain.length - 1 && !label;
      return {
        key: item.moduleCode,
        label: item.moduleLabel ?? item.moduleName,
        icon: item.moduleIcon || undefined,
        to: leaf || !item.moduleUrl ? undefined : item.moduleUrl,
      };
    });
    if (label) {
      items.push({ key: `${module.moduleCode}-title`, label });
    }
    return this.factory.breadcrumb({
      items,
      class: "mmda-test-breadcrumb",
    });
  }

  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    return paintModuleToolbar(this.factory, context, props, slots, {
      className: "mmda-toolbar",
      breadcrumb: () =>
        this.buildModuleBreadcrumb(context, {
          module: (context as any).module,
          label: props.breadcrumbLeaf || "",
        }),
      actionGroup: () =>
        this.factory.buttonGroup(() => [], {
          class: "mmda-test-toolbar-actions",
        }),
      moreActions: () => defaultToolbarMoreActions(this.actionFactory, context),
      navActions: () => [],
      openSearchPage: () => {
        if (props.onSearchPage) props.onSearchPage();
        else void this.buildSearchPage(context);
      },
    });
  }

  buildSearchField(_field: UiSearchField) {
    return stub("buildSearchField");
  }

  buildSearchForm() {
    return stub("buildSearchForm");
  }

  buildModuleSearchbar(_context: UiContext, props: ModuleSearchbarProps) {
    return h("div", { class: "mmda-searchbar" }, [
      h("input", {
        class: "mmda-searchbar-input",
        type: "search",
        onChange: (event: Event) => {
          props.onSearch?.((event.target as HTMLInputElement).value);
        },
      }),
      h("button", {
        type: "button",
        class: "mmda-searchbar-refresh",
        onClick: () => props.onRefresh?.(),
      }),
    ]);
  }

  buildSearchForRelative(
    _context: UiContext,
    _field: MetaUiField,
    _props: SearchForRelativeProps,
  ) {
    return stub("buildSearchForRelative");
  }

  buildSigninForm(_props: SigninFormProps, _slots?: SigninFormSlots) {
    return stub("buildSigninForm");
  }

  buildSignupForm(_props: SignupFormProps) {
    return stub("buildSignupForm");
  }
}

function renderTestSplitter(panes: UiSplitterPane[], props: UiSplitterProps = {}) {
  return h(TestSplitter, {
    panes,
    orientation: props.orientation,
    splitterClass: props.class,
    collapseTick: props.collapseTick,
    onCollapsed: props.onCollapsed,
    onExpanded: props.onExpanded,
  });
}

const TestSplitter = defineComponent({
  name: "MmdaTestSplitter",
  props: {
    panes: { type: Array as PropType<UiSplitterPane[]>, required: true },
    orientation: { type: String as PropType<UiSplitterProps["orientation"]> },
    splitterClass: { type: String },
    collapseTick: { type: Number, default: 0 },
    onCollapsed: { type: Function as PropType<UiSplitterProps["onCollapsed"]> },
    onExpanded: { type: Function as PropType<UiSplitterProps["onExpanded"]> },
  },
  setup(props) {
    const collapsed = ref(props.panes.map((pane) => !!pane.collapsed));
    watch(
      () => props.collapseTick,
      (tick, prev) => {
        if (!tick || tick === prev) return;
        collapsed.value = collapsed.value.map((value, index) =>
          index === 0 ? true : value,
        );
      },
    );
    return () => {
      const vertical = props.orientation === "Vertical";
      return h(
        "div",
        {
          class: [
            "mmda-splitter",
            vertical ? "mmda-splitter--vertical" : "mmda-splitter--horizontal",
            props.splitterClass,
          ],
        },
        props.panes.flatMap((pane, index) => {
          const isCollapsed = collapsed.value[index];
          return [
            h(
              "div",
              {
                class: "mmda-splitter-pane",
                "data-collapsible": pane.collapsible ? "true" : undefined,
                "data-collapsed": isCollapsed ? "true" : undefined,
                style: isCollapsed
                  ? { display: "none" }
                  : index === 0
                    ? {
                        [vertical ? "height" : "width"]: pane.size ?? "16rem",
                        flex: "0 0 auto",
                      }
                    : { flex: "1 1 auto", minWidth: 0, minHeight: 0 },
              },
              pane.content,
            ),
            pane.collapsible && index === 0
              ? h("button", {
                  type: "button",
                  class: "mmda-splitter-collapse",
                  "aria-label": isCollapsed ? "expand" : "collapse",
                  onClick: () => {
                    const next = !collapsed.value[index];
                    collapsed.value = collapsed.value.map((value, i) =>
                      i === index ? next : value,
                    );
                    const event = { index, collapsed: next };
                    if (next) props.onCollapsed?.(event);
                    else props.onExpanded?.(event);
                  },
                })
              : null,
          ];
        }),
      );
    };
  },
});

const TestTree = defineComponent({
  name: "MmdaTestTree",
  props: {
    data: { type: Array, default: () => [] },
    fields: { type: Object, default: undefined },
    selected: { type: [String, Array], default: undefined },
    class: { type: String, default: "" },
    editing: { type: String, default: "" },
    contextMenu: { type: Function, default: undefined },
    showHoverAdd: { type: [Boolean, Function], default: undefined },
    onNodeSelect: { type: Function, default: undefined },
    onExpand: { type: Function, default: undefined },
    onNodeRename: { type: Function, default: undefined },
    onNodeAddChild: { type: Function, default: undefined },
    allowDragDrop: { type: Boolean, default: false },
    onNodeMove: { type: Function, default: undefined },
  },
  setup(props: UiTreePropsType) {
    const menu = ref<{ items: { label: string; divider?: boolean }[] } | null>(
      null,
    );
    const hoverId = ref("");
    return () =>
      h("div", { class: "mmda-test-tree-host" }, [
        h(
          "ul",
          {
            class: treeModifierClasses(props),
            "data-has-context-menu": props.contextMenu ? "1" : undefined,
            "data-allow-drag-drop": props.allowDragDrop ? "1" : undefined,
          },
          (props.data ?? []).map((node) => {
            const id = treeIdOf(node, props.fields);
            const editing = props.editing && id === String(props.editing);
            const canHover =
              Boolean(props.onNodeAddChild) &&
              props.showHoverAdd !== false &&
              (typeof props.showHoverAdd === "function"
                ? props.showHoverAdd(node)
                : true);
            return h(
              "li",
              {
                class: "mmda-tree-row",
                onClick: () => props.onNodeSelect?.(node),
                onMouseenter: () => {
                  hoverId.value = canHover ? id : "";
                },
                onMouseleave: () => {
                  hoverId.value = "";
                },
                onContextmenu: (event: MouseEvent) => {
                  event.preventDefault();
                  if (!props.contextMenu) {
                    menu.value = null;
                    return;
                  }
                  const items = props.contextMenu(node) ?? [];
                  menu.value = {
                    items: items.map((item) => ({
                      label: item.divider ? "" : (item.label ?? item.name ?? ""),
                      divider: Boolean(item.divider),
                    })),
                  };
                },
              },
              [
                h(
                  "button",
                  {
                    type: "button",
                    class: "mmda-tree-expand",
                    onClick: (event: Event) => {
                      event.stopPropagation();
                      props.onExpand?.(node);
                    },
                  },
                  ">",
                ),
                editing
                  ? h("input", {
                      class: "mmda-tree-rename-input",
                      value: treeLabelOf(node, props.fields),
                      onKeydown: (event: KeyboardEvent) => {
                        if (event.key === "Enter") {
                          props.onNodeRename?.(
                            node,
                            (event.target as HTMLInputElement).value,
                          );
                        }
                      },
                      onBlur: (event: Event) =>
                        props.onNodeRename?.(
                          node,
                          (event.target as HTMLInputElement).value,
                        ),
                    })
                  : h(
                      "span",
                      { class: "mmda-tree-label" },
                      treeLabelOf(node, props.fields),
                    ),
                canHover && hoverId.value === id
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "mmda-tree-hover-add",
                        onClick: (event: Event) => {
                          event.stopPropagation();
                          props.onNodeAddChild?.(node);
                        },
                      },
                      "+",
                    )
                  : null,
              ],
            );
          }),
        ),
        menu.value
          ? h(
              "div",
              { class: "mmda-test-tree-menu", role: "menu" },
              menu.value.items.map((item) =>
                item.divider
                  ? h("div", { class: "mmda-test-tree-menu-divider" })
                  : h("div", { class: "mmda-test-tree-menu-item" }, item.label),
              ),
            )
          : null,
      ]);
  },
});

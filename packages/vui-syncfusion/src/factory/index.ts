import { h } from "vue";
import type { PropData, SyncfusionUiFactory, UiSlots } from "@mmda/vui";
import { createIconVNode, MATERIAL_SYMBOL_PREFIX } from "@mmda/vui";
import { SwitchComponent } from "@syncfusion/ej2-vue-buttons";
import { DatePickerComponent } from "@syncfusion/ej2-vue-calendars";
import { DropDownListComponent } from "@syncfusion/ej2-vue-dropdowns";
import {
  NumericTextBoxComponent,
  TextAreaComponent,
  TextBoxComponent,
} from "@syncfusion/ej2-vue-inputs";
import { syncfusionLayout } from "../syncfusion_layout";
import { patchChoiceFilter } from "./grid-inject";
import { createTableRenderer } from "./table";
import { attachButtonRenderers, createButton } from "./buttons";
import { attachOverlayRenderers } from "./overlays";
import { createSplitterRenderer } from "./splitter";
import { attachChartRenderers } from "./charts";
import { attachMediaRenderers } from "./media";
import { attachNavigationRenderers } from "./navigation";
import { attachTreeGridRenderer } from "./tree-grid";
import { attachMiscellaneousRenderers } from "./miscellaneous";

export { autoFitSyncfusionListGrid } from "./grid";
export { splitterEventIndex } from "./splitter";
export { resolveFieldUnit } from "./utils";
export { SfGrid, SfGridLoadingHost } from "./grid";
export { SfSplitter } from "./splitter";

import "./grid-inject";

export function createSyncfusionUiFactory(): SyncfusionUiFactory {
  patchChoiceFilter();
  const button = createButton;

  const factory: any = {
    layout: syncfusionLayout,
    nativeInplaceEdit: true,
    integratedTablePaging: true,
    defaultFilterDisplay: "menu",
    actionIcons: {
      details: "e-icons e-eye",
      create: "e-icons e-plus",
      edit: "e-icons e-edit",
      save: "e-icons e-save",
      cancel: "e-icons e-close",
      delete: "e-icons e-trash",
      clear: "e-icons e-erase",
      add: "e-icons e-plus",
      refresh: "e-icons e-refresh",
      search: "e-icons e-search",
      reset: "e-icons e-filter-clear",
      back: "e-icons e-chevron-left",
      import: "e-icons e-upload-1",
      export: "e-icons e-download",
      "auto-fit-columns": "e-icons e-auto-fit-all-column",
      settings: "e-icons e-settings",
      more: "e-icons e-more-vertical-1",
      file: "e-icons e-file",
      "eye-slash": "fas fa-eye-slash",
      "dnd-vert": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "drag-indicator": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "freeze-column-right": "e-icons e-spacing-before",
      "freeze-column-left": "e-icons e-spacing-after",
      unlock: "e-icons e-unlock",
    },
    viewIcons: {
      index: "e-icons e-list-unordered",
      details: "e-icons e-eye",
      create: "e-icons e-plus",
      edit: "e-icons e-edit",
    },
    dialogIcons: {
      success: "e-icons e-circle-check",
      info: "e-icons e-circle-info",
      warning: "e-icons e-warning",
      error: "e-icons e-circle-close",
    },
    resolveIcon(icon: string) {
      if (!icon) return "";
      if (icon.startsWith("e-icons") || icon.startsWith("e-")) return icon;
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon;
      if (icon.startsWith("pi ")) {
        const name = icon.replace(/^pi pi-/, "");
        return factory.actionIcons[name] ?? `e-icons e-${name}`;
      }
      return factory.actionIcons[icon] ?? `e-icons e-${icon}`;
    },
    textSpan: (text: any, props: any) => h("span", props, text),
    label: (text: any, props: any) => h("label", props, text),
    icon: (name: string, props: any) =>
      createIconVNode(factory.resolveIcon(name), props),
    badge: (props: any) =>
      h(
        "span",
        {
          class: [
            "e-badge",
            props.severity === "danger"
              ? "e-badge-danger"
              : props.severity === "warning"
                ? "e-badge-warning"
                : props.severity === "success"
                  ? "e-badge-success"
                  : "e-badge-info",
            props.class,
          ],
        },
        String(props.value),
      ),
    title: (text: any, props: any) => h("h2", props, text),
    subtitle: (text: any, props: any) => h("h3", props, text),
    link: (props: any, slots: any) =>
      h(
        "a",
        { ...props, class: ["e-link", props.class] },
        slots?.default?.() ?? props.text,
      ),
    input: (value: any, props: PropData = {}) =>
      h(TextBoxComponent as any, {
        value: props.modelValue ?? value,
        input: (args: any) =>
          (props["onUpdate:modelValue"] ?? props.onUpdate)?.(args.value),
        change: (args: any) =>
          (props["onUpdate:modelValue"] ?? props.onUpdate)?.(args.value),
        ...props,
      }),
    iconField: (value: any, props: PropData = {}) =>
      h("span", { class: "e-input-group" }, [
        props.icon && h("span", { class: factory.resolveIcon(props.icon) }),
        factory.input(value, props),
      ]),
    dropdown: (value: any, props: PropData = {}) =>
      h(DropDownListComponent as any, {
        value: props.modelValue ?? value,
        dataSource: props.options ?? props.dataSource,
        change: (args: any) =>
          (props["onUpdate:modelValue"] ?? props.onUpdate)?.(args.value),
        ...props,
      }),
    formItem: (props: PropData = {}, slots?: UiSlots) =>
      h(
        "div",
        { class: ["mmda-sf-form-item", props.class], style: props.style },
        [
          props.label
            ? h(
                "label",
                { class: "mmda-sf-form-item__label" },
                String(props.label),
              )
            : null,
          slots?.default?.() ??
            factory.input(props.modelValue, {
              ...props,
              onUpdate: props.onUpdate ?? props["onUpdate:modelValue"],
            }),
        ],
      ),
    column: (props: PropData = {}, slots?: UiSlots) => ({
      ...props,
      header: props.header,
      field: props.field,
      body: slots?.body ?? props.body,
    }),
    primeVueTable: (data: any[] = [], columns: any[] = [], props: PropData = {}) =>
      factory.dataTable(data, columns, props),
    dataTable: (data: any[] = [], columns: any[] = [], props: PropData = {}) =>
      h(
        "div",
        {
          class: ["mmda-sf-data-table", "e-grid", props.class],
          style: props.style,
        },
        [
          h("table", { class: "e-table" }, [
            h(
              "thead",
              h(
                "tr",
                columns.map((col, i) =>
                  h(
                    "th",
                    { key: col.field ?? i, style: col.style },
                    typeof col.header === "function"
                      ? col.header()
                      : (col.header ?? col.field),
                  ),
                ),
              ),
            ),
            h(
              "tbody",
              (data ?? []).map((row, index) =>
                h(
                  "tr",
                  {
                    key: row?.id ?? index,
                    onDblclick: () => props.onItemDoubleClick?.(row),
                  },
                  columns.map((col, i) =>
                    h(
                      "td",
                      { key: col.field ?? i, style: col.style },
                      col.body
                        ? col.body({ data: row, index })
                        : row?.[col.field],
                    ),
                  ),
                ),
              ),
            ),
          ]),
        ],
      ),
    datePicker: (props: PropData = {}) =>
      h(DatePickerComponent as any, {
        value: props.modelValue ?? props.value,
        change: (args: any) =>
          (
            props.onUpdatePicker ??
            props.onUpdate ??
            props["onUpdate:modelValue"]
          )?.(args.value),
        ...props,
      }),
    numberInput: (props: PropData = {}) =>
      h(NumericTextBoxComponent as any, {
        value: props.modelValue ?? props.value,
        change: (args: any) =>
          (props.onUpdate ?? props["onUpdate:modelValue"])?.(args.value),
        ...props,
      }),
    select: (props: PropData = {}) =>
      factory.dropdown(props.modelValue, {
        ...props,
        fields: props.optionLabel
          ? { text: props.optionLabel, value: props.dataKey ?? "value" }
          : props.fields,
      }),
    toggleSwitch: (value: any, props: PropData = {}) =>
      h(SwitchComponent as any, {
        checked: props.modelValue ?? value,
        change: (args: any) =>
          (props.onUpdate ?? props["onUpdate:modelValue"])?.(args.checked),
        ...props,
      }),
    textarea: (value: any, props: PropData = {}) =>
      h(TextAreaComponent as any, {
        value: props.modelValue ?? value,
        input: (args: any) =>
          (props.onUpdate ?? props["onUpdate:modelValue"])?.(args.value),
        ...props,
      }),
    dataViewBox: (props: PropData = {}, slots?: UiSlots) =>
      h(
        "div",
        {
          class: ["mmda-sf-data-view", props.class],
          style: props.listStyle ?? props.style,
        },
        (props.value ?? []).map((item: any, index: number) =>
          h(
            "div",
            { key: item?.id ?? index, class: "mmda-sf-data-view__item" },
            slots?.item?.(item, index) ?? String(item),
          ),
        ),
      ),
  };

  attachButtonRenderers(factory, button);
  attachNavigationRenderers(factory);
  attachTreeGridRenderer(factory);
  attachOverlayRenderers(factory);
  attachChartRenderers(factory);
  attachMediaRenderers(factory);
  attachMiscellaneousRenderers(factory);
  factory.splitter = createSplitterRenderer();
  factory.table = createTableRenderer({
    button,
    paginator: factory.paginator,
    resolveIcon: (icon: string) => factory.resolveIcon(icon),
  });
  factory.pagableTable = (loader: any, metadata: any, props: any) =>
    h("div", { class: "mmda-sf-pagable-table" }, [
      factory.table(loader.model.list as any[], metadata.metaui, props as any),
      factory.paginator(loader.model.pagination, props),
    ]);

  return factory as SyncfusionUiFactory;
}

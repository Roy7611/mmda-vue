import { h, reactive, unref, type VNode } from "vue";
import {
  SqlDataType,
  SortOrder,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  getFieldSearchOps,
  type EntityFieldFilter,
  type EntityFilterModel,
  type MetaUi,
  type MetaUiField,
  type Pagination,
} from "@mmda/core";
import type {
  PrimeVueUiFactory,
  PropData,
  UiAction,
  UiListPropsType,
  UiPaginatorPropsType,
  UiSlots,
} from "@mmda/vui";
import {
  createIconVNode,
  MATERIAL_SYMBOL_PREFIX,
} from "@mmda/vui";
import Badge from "primevue/badge";
import Button from "primevue/button";
import ButtonGroup from "primevue/buttongroup";
import Chart from "primevue/chart";
import Column from "primevue/column";
import DatePicker from "primevue/datepicker";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import Dialog from "primevue/dialog";
import Drawer from "primevue/drawer";
import Image from "primevue/image";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import PanelMenu from "primevue/panelmenu";
import Paginator from "primevue/paginator";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import MultiSelect from "primevue/multiselect";
import SplitButton from "primevue/splitbutton";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import Tag from "primevue/tag";
import { primeLayout } from "./prime_layout";
import { MmdaPrimeTree } from "./components/MmdaPrimeTree";

const EMPTY_SELECTION: unknown[] = [];

const invoke = (value: unknown) =>
  typeof value === "function" ? (value as () => unknown)() : value;

const listedFields = (metaui: MetaUi) => {
  const fields = metaui.getListedFields();
  return fields.length
    ? fields
    : metaui.groups
        .filter((group) => !group.many)
        .flatMap((group) => group.fields);
};

const severity = (role?: string) => {
  const roles: Record<string, string> = {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    info: "info",
    warning: "warn",
    warn: "warn",
    danger: "danger",
    error: "danger",
    contrast: "contrast",
  };
  return role ? roles[role] : undefined;
};

const normalizeAction = (action: UiAction, t?: (key: string) => string) => ({
  label:
    action.label ??
    (action.name && t ? t(`action.${action.name}`) : action.name),
  icon: action.icon,
  disabled: action.disabled === true || action.disabled === "true",
  separator: action.divider,
  command: action.onAction ?? action.command,
});

/** 菜单项保留嵌套 items / url / key，不能走 normalizeAction（会剥掉子菜单） */
const normalizeMenuItem = (item: any): any => {
  if (!item || typeof item !== "object") return item;
  const children = Array.isArray(item.items)
    ? item.items.map((child: any) => normalizeMenuItem(child))
    : undefined;
  return {
    key: item.key ?? item.moduleCode,
    label: item.label,
    icon: item.icon,
    url: item.url,
    route: item.route,
    moduleCode: item.moduleCode,
    disabled: item.disabled,
    command: item.command ?? item.onAction,
    items: children?.length
      ? children
      : item.items === undefined
        ? undefined
        : children,
  };
};

export function createPrimeVueUiFactory(): PrimeVueUiFactory {
  const button = (props: any, slots?: any) =>
    h(
      Button,
      {
        type: props.type ?? "button",
        label: props.label,
        icon: props.icon,
        severity: severity(
          props.colorRole ??
            props.severity ??
            (props.buttonType === "tonal" ? "secondary" : undefined),
        ),
        variant:
          props.buttonType === "outlined"
            ? "outlined"
            : props.buttonType === "text" || props.buttonType === "link"
              ? "text"
              : undefined,
        rounded: props.shape === "round" || props.shape === "circle",
        disabled: props.disabled === true || props.disabled === "true",
        loading: props.loading,
        title: props.tooltip,
        size: props.size,
        onClick: props.onClick ?? props.onAction ?? props.command,
        ...props,
      },
      slots,
    );

  const table = <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaui);
    const selectionMode =
      props.selectionMode === "multiple"
        ? "multiple"
        : props.selectionMode === "single"
          ? "single"
          : undefined;
    const showColumnFilters =
      (props as { filterDisplay?: string }).filterDisplay === "row";
    const columnFilter = (field: MetaUiField) => {
      if (!showColumnFilters) return undefined;
      const filterModel = (props.filterModel ?? {}) as EntityFilterModel;
      const fieldName = field.fieldName!;
      const current = filterModel[fieldName];
      const state = reactive({
        operator:
          current && "operator" in current
            ? current.operator
            : (getFieldSearchOps(field)[0]?.name ?? "EQ"),
        value:
          current?.filterType === "set"
            ? [...current.values]
            : current && "value" in current
              ? current.value
              : undefined,
        valueTo: current && "valueTo" in current ? current.valueTo : undefined,
      });
      const apply = (filter?: EntityFieldFilter) => {
        const next = { ...filterModel };
        if (filter) next[fieldName] = filter;
        else delete next[fieldName];
        props.onFilterModelChange?.(next);
      };
      const enumOptions = (field.reference?.refOptions ?? []).map((option) => ({
        label: field.reference!.labelOf(option),
        value: field.reference!.valueOf(option),
      }));
      const noValue = ["IS_NULL", "IS_NOT_NULL", "IS_ALL"].includes(
        state.operator ?? "",
      );
      const editor = field.reference?.isEnum
        ? h(MultiSelect, {
            modelValue: state.value,
            options: enumOptions,
            optionLabel: "label",
            optionValue: "value",
            display: "chip",
            placeholder: field.displayLabel,
            "onUpdate:modelValue": (value: unknown[]) => (state.value = value),
          })
        : SqlDataType.isBool(field.dataType)
          ? h(Select, {
              modelValue: state.value,
              options: [
                { label: props.filterLabels?.all ?? "All", value: null },
                { label: props.filterLabels?.yes ?? "Yes", value: true },
                { label: props.filterLabels?.no ?? "No", value: false },
              ],
              optionLabel: "label",
              optionValue: "value",
              "onUpdate:modelValue": (value: boolean | null) =>
                (state.value = value),
            })
          : h("div", { class: "mmda-prime-column-filter__values" }, [
              h(Select, {
                modelValue: state.operator,
                options: getFieldSearchOps(field).map((op) => ({
                  ...op,
                  label: op.label ?? op.name,
                })),
                optionLabel: "label",
                optionValue: "name",
                "onUpdate:modelValue": (value: string) =>
                  (state.operator = value),
              }),
              !noValue &&
                (SqlDataType.isDate(field.dataType)
                  ? h(DatePicker as any, {
                      modelValue: state.value,
                      dateFormat: "yy-mm-dd",
                      "onUpdate:modelValue": (value: any) =>
                        (state.value = value),
                    })
                  : SqlDataType.isNum(field.dataType)
                    ? h(InputNumber as any, {
                        modelValue: state.value,
                        "onUpdate:modelValue": (value: number | null) =>
                          (state.value = value),
                      })
                    : h(InputText as any, {
                        modelValue: state.value,
                        "onUpdate:modelValue": (value: string) =>
                          (state.value = value),
                      })),
              state.operator === "BETWEEN" &&
                (SqlDataType.isDate(field.dataType)
                  ? h(DatePicker as any, {
                      modelValue: state.valueTo,
                      dateFormat: "yy-mm-dd",
                      "onUpdate:modelValue": (value: any) =>
                        (state.valueTo = value),
                    })
                  : h(InputNumber as any, {
                      modelValue: state.valueTo,
                      "onUpdate:modelValue": (value: number | null) =>
                        (state.valueTo = value),
                    })),
            ]);

      return h("div", { class: "mmda-prime-column-filter" }, [
        editor,
        h("div", { class: "mmda-prime-column-filter__actions" }, [
          h(Button, {
            icon: "pi pi-check",
            size: "small",
            text: true,
            ariaLabel: props.filterLabels?.apply ?? "Apply",
            onClick: () => {
              if (field.reference?.isEnum) {
                apply({
                  filterType: "set",
                  values: Array.isArray(state.value) ? state.value : [],
                });
              } else if (SqlDataType.isBool(field.dataType)) {
                apply(
                  state.value == null
                    ? undefined
                    : { filterType: "boolean", value: Boolean(state.value) },
                );
              } else {
                apply({
                  filterType: SqlDataType.isDate(field.dataType)
                    ? "date"
                    : SqlDataType.isNum(field.dataType)
                      ? "number"
                      : "text",
                  operator: state.operator as any,
                  value: state.value,
                  valueTo: state.valueTo,
                });
              }
            },
          }),
          h(Button, {
            icon: "pi pi-times",
            size: "small",
            text: true,
            severity: "secondary",
            ariaLabel: props.filterLabels?.clear ?? "Clear",
            onClick: () => apply(undefined),
          }),
        ]),
      ]);
    };

    const dataColumns = fields.map((field) => {
      const renderRow = (data: T) => {
        if (props.renderCell) return props.renderCell(field, data);
        const custom = props.customCellRenderers?.[field.fieldName];
        if (custom) return custom(field, data);
        const value = (data as any)[field.fieldName];
        return field.reference?.refOptions?.length
          ? field.reference.labelOf(value)
          : String(value ?? "");
      };
      return h(
        Column,
        {
          key: field.fieldName,
          field: field.fieldName,
          header: field.displayLabel,
          sortable:
            props.enableSort === false
              ? false
              : Boolean((field as any).sortable),
          style: (field as any).width
            ? { width: `${(field as any).width}px` }
            : undefined,
        },
        {
          ...(showColumnFilters
            ? {
                header: () =>
                  h("div", { class: "mmda-prime-column-header" }, [
                    h("span", field.displayLabel),
                    columnFilter(field),
                  ]),
              }
            : {}),
          body: ({ data }: { data: T }) => renderRow(data),
        },
      );
    });

    const columns: VNode[] = [
      ...(selectionMode
        ? [
            h(Column, {
              selectionMode,
              headerStyle: "width: 3rem",
            }),
          ]
        : []),
      ...dataColumns,
    ];

    const tableProps: Record<string, unknown> = {
      value: model,
      dataKey: metaui.primaryKey,
      stripedRows: props.striped ?? true,
      showGridlines: props.showGridlines ?? false,
      loading: unref(props.loading),
      resizableColumns: props.resizableColumns ?? true,
      scrollable: props.scrollable ?? true,
      scrollHeight:
        props.scrollHeight ?? props.height ?? props.maxHeight ?? "flex",
      tableStyle: props.tableStyle ?? { minWidth: "50rem" },
      size: props.size ?? "small",
      onRowClick: (event: any) => props.onItemClick?.(event.data),
      onRowDblclick: (event: any) => props.onItemDoubleClick?.(event.data),
      onRowContextmenu: (event: any) => props.onItemContextMenu?.(event.data),
      rowStyle: props.rowStyle,
      sortMode: props.enableSort === false ? undefined : "multiple",
      onSort: (event: any) => {
        if (props.enableSort === false) return;
        const sorts = event.multiSortMeta?.length
          ? event.multiSortMeta
          : event.sortField
            ? [{ field: event.sortField, order: event.sortOrder }]
            : [];
        props.onSort?.(
          sorts.map((sort: any) => ({
            sortBy: sort.field,
            sortOrder: sort.order === -1 ? SortOrder.DESC : SortOrder.ASC,
          })),
        );
      },
      class: ["mmda-prime-table", props.class].filter(Boolean).join(" "),
    };

    if (selectionMode) {
      tableProps.selection = (props.selectedItems ??
        EMPTY_SELECTION) as T[];
      tableProps.selectionMode = selectionMode;
      tableProps["onUpdate:selection"] = (value: T | T[]) => {
        const next = Array.isArray(value) ? value : value ? [value] : [];
        const current = (props.selectedItems ?? EMPTY_SELECTION) as T[];
        if (
          current === next ||
          (current.length === next.length &&
            current.every((item, index) => item === next[index]))
        ) {
          return;
        }
        props.onSelectionChange?.(next);
        props.onSelect?.(next);
      };
    }

    return h(DataTable as any, tableProps, {
      empty: () => props.empty?.() ?? "",
      loading: () => props.loadingSlot?.(),
      default: () => columns,
    });
  };

  const factory: PrimeVueUiFactory = {
    layout: primeLayout,
    actionIcons: {
      create: "pi pi-plus",
      edit: "pi pi-pencil",
      save: "pi pi-check",
      cancel: "pi pi-times",
      delete: "pi pi-trash",
      refresh: "pi pi-refresh",
      search: "pi pi-search",
      reset: "pi pi-filter-slash",
      back: "pi pi-arrow-left",
      import: "pi pi-upload",
      export: "pi pi-download",
      "eye-slash": "pi pi-eye-slash",
      "dnd-vert": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "drag-indicator": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "freeze-column-right": "pi pi-arrow-right",
      "freeze-column-left": "pi pi-arrow-left",
      unlock: "pi pi-lock-open",
    },
    viewIcons: {
      index: "pi pi-list",
      details: "pi pi-eye",
      create: "pi pi-plus",
      edit: "pi pi-pencil",
    },
    dialogIcons: {
      success: "pi pi-check-circle",
      info: "pi pi-info-circle",
      warning: "pi pi-exclamation-triangle",
      error: "pi pi-times-circle",
    },
    resolveIcon(icon: string) {
      if (!icon) return "";
      if (icon.startsWith("pi ")) return icon;
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon;
      return factory.actionIcons[icon] ?? `pi pi-${icon}`;
    },
    textSpan: (text, props) => h("span", props, text),
    label: (text, props) => h("label", props, text),
    image: (src, props) => h(Image, { src, preview: props?.preview, ...props }),
    icon: (name, props) => createIconVNode(factory.resolveIcon(name), props),
    badge: (props) =>
      h(Badge, {
        value: props.value,
        severity: props.severity,
        class: props.class,
      }),
    title: (text, props) => h("h2", props, text),
    subtitle: (text, props) => h("h3", props, text),
    link: (props, slots) =>
      h(
        "a",
        { ...props, class: ["p-button p-button-link", props.class] },
        slots?.default?.() ?? props.text,
      ),
    input: (value, props = {}) =>
      h(InputText, {
        modelValue: props.modelValue ?? value,
        "onUpdate:modelValue": props["onUpdate:modelValue"] ?? props.onUpdate,
        ...props,
      }),
    iconField: (value, props = {}) =>
      h("span", { class: "p-input-icon-left" }, [
        props.icon && h("i", { class: factory.resolveIcon(props.icon) }),
        h(InputText, {
          modelValue: props.modelValue ?? value,
          "onUpdate:modelValue": props["onUpdate:modelValue"] ?? props.onUpdate,
          ...props,
        }),
      ]),
    dropdown: (value, props = {}) =>
      h(Select, {
        modelValue: props.modelValue ?? value,
        "onUpdate:modelValue": props["onUpdate:modelValue"] ?? props.onUpdate,
        ...props,
      }),
    button,
    buttonGroup: (buttons, props) =>
      h(
        ButtonGroup,
        {
          ...props,
          class: ["mmda-prime-button-group", props?.class],
        },
        {
          default: () => buttons().filter(Boolean),
        },
      ),
    splitButton: (props, slots) =>
      h(
        SplitButton as any,
        {
          ...props,
          model: (props.actions ?? []).map((action) => normalizeAction(action)),
          onClick: props.onAction ?? props.command,
        },
        slots,
      ),
    menuButton: (props, actions, slots) => {
      const hideCaret =
        props.hideCaret === true ||
        props.shape === "circle" ||
        (!props.label && Boolean(props.icon));
      const isText = hideCaret || props.buttonType === "text";
      // icon-only：用下拉半边承载图标，避免 SplitButton 双段把 footer 撑乱
      return h(
        SplitButton as any,
        {
          ...props,
          label: hideCaret ? undefined : props.label,
          icon: hideCaret ? undefined : props.icon,
          dropdownIcon: hideCaret ? props.icon : props.dropdownIcon,
          rounded: hideCaret || props.shape === "circle" || props.shape === "round",
          text: isText,
          outlined: props.buttonType === "outlined",
          severity: severity(
            props.colorRole ??
              props.severity ??
              (props.buttonType === "tonal" ? "secondary" : undefined),
          ),
          class: [
            props.class,
            hideCaret ? "mmda-menu-button--icon-only" : "",
            props.buttonType === "tonal" ? "mmda-btn-tonal" : "",
          ]
            .filter(Boolean)
            .join(" "),
          model: actions.map((action) => normalizeAction(action)),
          onClick: props.onAction ?? props.command,
        },
        slots,
      );
    },
    floatingActionButton: (props) =>
      button({
        ...props,
        rounded: true,
        class: ["mmda-prime-fab", props.class],
      }),
    selectButton: (value, props, slots) =>
      h(
        SelectButton,
        {
          modelValue: props.modelValue ?? value,
          "onUpdate:modelValue": props["onUpdate:modelValue"] ?? props.onUpdate,
          ...props,
        },
        slots,
      ),
    actionButton: (action, t, _resolve, props) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        ...props,
        icon: factory.resolveIcon(action.icon ?? action.name ?? ""),
        onClick: action.onAction ?? action.command,
      }),
    paginator: (pagination: Pagination, props: UiPaginatorPropsType) =>
      h(Paginator, {
        first: Math.max(
          0,
          ((pagination.pageNo ?? 1) - 1) *
            (pagination.pageSize ?? DEFAULT_PAGE_SIZE),
        ),
        rows: pagination.pageSize ?? DEFAULT_PAGE_SIZE,
        totalRecords: pagination.recordCount ?? 0,
        rowsPerPageOptions: props.pageSizeOptions ?? [
          ...DEFAULT_PAGE_SIZE_OPTIONS,
        ],
        template:
          props.template ??
          "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
        onPage: (event: any) =>
          props.onPage({
            pageNo: event.page + 1,
            pageSize: event.rows,
          }),
      }),
    tree: (props) => h(MmdaPrimeTree, props as any),
    list: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
      h(
        DataView,
        { value: model, layout: "list", class: "mmda-prime-list" },
        {
          empty: () => props.empty?.() ?? "",
          list: ({ items }: { items: T[] }) =>
            h(
              "div",
              { class: "mmda-prime-list__items" },
              items.map((item, index) =>
                h(
                  "article",
                  {
                    key:
                      props.itemKey?.(item) ??
                      String(
                        metaui.primaryKey
                          ? (item as any)[metaui.primaryKey]
                          : index,
                      ),
                    class: ["mmda-prime-list__item", props.itemClass?.(item)],
                    style: props.itemStyle?.(item),
                    onClick: () => props.onItemClick?.(item),
                    onDblclick: () => props.onItemDoubleClick?.(item),
                  },
                  invoke(props.item?.(item, index)) as any,
                ),
              ),
            ),
        },
      ),
    table,
    pagableTable: (loader, metadata, props) =>
      h("div", { class: "mmda-prime-pagable-table" }, [
        table(loader.model.list as any[], metadata.metaui, props as any),
        factory.paginator(loader.model.pagination, props),
      ]),
    loading: (props) => h("div", { class: "mmda-prime-loading", ...props }),
    scrollbar: (content, props) =>
      h("div", { class: "mmda-prime-scrollbar", ...props }, content as any),
    menu: (items, props) =>
      h(Menu, {
        model: items.map((item) => normalizeMenuItem(item)),
        ...props,
      }),
    panelMenu: (items, props, slots) =>
      h(
        PanelMenu,
        { model: items.map((item) => normalizeMenuItem(item)), ...props },
        slots,
      ),
    menubar: (items, props, slots) =>
      h(
        Menubar,
        { model: items.map((item) => normalizeMenuItem(item)), ...props },
        slots,
      ),
    dialog: (
      props: PropData & {
        visible: boolean;
        onUpdateVisible: (value: boolean) => void;
      },
      slots?: UiSlots,
    ) =>
      h(
        Dialog,
        {
          modal: true,
          ...props,
          "onUpdate:visible": props.onUpdateVisible,
        },
        slots,
      ),
    drawer: (props, slots) =>
      h(Drawer, { ...props, "onUpdate:visible": props.onUpdateVisible }, slots),
    splitter: (panes, props) =>
      h(
        Splitter,
        {
          class: ["mmda-prime-splitter", props?.class].filter(Boolean).join(" "),
          layout: props?.orientation === "Vertical" ? "vertical" : "horizontal",
        },
        {
          default: () =>
            panes.map((pane, index) =>
              h(
                SplitterPanel,
                {
                  size: index === 0 ? (props?.collapsedFirst ? 4 : 20) : 80,
                  minSize: index === 0 ? (props?.collapsedFirst ? 4 : 12) : 20,
                  style:
                    index === 0
                      ? {
                          flexBasis: props?.collapsedFirst
                            ? "3rem"
                            : (pane.size ?? "16rem"),
                          flexGrow: props?.collapsedFirst ? 0 : undefined,
                        }
                      : undefined,
                },
                { default: () => pane.content },
              ),
            ),
        },
      ),
    searchForRelative: (props, slots) =>
      h(
        Dialog,
        {
          modal: true,
          header: props.title,
          visible: props.visible,
          "onUpdate:visible": props.onUpdateVisible,
        },
        slots,
      ),
    chart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: props.type ?? "bar", data, ...props }),
    barChart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: "bar", data, ...props }),
    lineChart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: "line", data, ...props }),
    pieChart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: "pie", data, ...props }),
    doughnutChart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: "doughnut", data, ...props }),
    polarAreaChart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: "polarArea", data, ...props }),
    radarChart: (data: any, props: PropData = {}) =>
      h(Chart as any, { type: "radar", data, ...props }),
  };

  return factory;
}

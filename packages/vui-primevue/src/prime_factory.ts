import { h, reactive, unref, type VNode } from "vue";
import {
  SqlDataType,
  SortOrder,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  getFieldFilterOps,
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
  UiTreeGridPropsType,
} from "@mmda/vui";
import {
  assembleTreeGridRows,
  listedTableFields,
  treeRowId,
  bindListDisplayRenderers,
  wrapListFamilyPaginator,
  renderSearchForRelativeField,
  switchArgs,
  createFileUploader,
  createFilesUploader,
  createImageUploader,
  createImagesUploader,
  renderFileLink,
  wrapRowDetail,
} from "@mmda/vui";
import { createBadge } from "./factory/badge";
import { createAvatar } from "./factory/avatar";
import { createBarcode } from "./factory/barcode";
import { createQrCode } from "./factory/qrcode";
import { createBreadcrumb } from "./factory/breadcrumb";
import { createCalendar } from "./factory/calendar";
import { createCarousel } from "./factory/carousel";
import { createCheckBox } from "./factory/checkbox";
import { createSwitch } from "./factory/switch";
import { createCheckBoxList, createBitCheckBoxList } from "./factory/check_box_list";
import { createChips } from "./factory/chips";
import { createContextMenu } from "./factory/context_menu";
import { createCard } from "./factory/card";
import { createDivider } from "./factory/divider";
import { createTooltip } from "./factory/tooltip";
import { createInplaceEditor } from "./factory/inplace_editor";
import { createColorPicker } from "./factory/color_picker";
import { createMaskedTextBox } from "./factory/maskedTextBox";
import { createOneTimePasswordInput } from "./factory/oneTimePasswordInput";
import { createQueryBuilder } from "./factory/query_builder";
import { createSlider } from "./factory/slider";
import { createRating } from "./factory/rating";
import { createTabs } from "./factory/tabs";
import { createToolbar } from "./factory/toolbar";
import { createDrawer, createSidebar } from "./factory/sidebar";
import { createSplitter } from "./factory/splitter";
import { createNumberInput } from "./factory/number_input";
import { createTextArea } from "./factory/text_area";
import { createTextInput } from "./factory/text_input";
import { createProgressBar } from "./factory/progress_bar";
import { createSignaturePad } from "./factory/signature_pad";
import { createStepper } from "./factory/stepper";
import { createTimeline } from "./factory/timeline";
import { createSkeleton } from "./factory/skeleton";
import { createLoading } from "./factory/loading";
import { createSpeechToText } from "./factory/speech_to_text";
import { createDatePicker } from "./factory/date_picker";
import { createDateTimePicker } from "./factory/date_time_picker";
import { createTimePicker } from "./factory/time_picker";
import { createDateRangePicker } from "./factory/date_range_picker";
import { createDropDownList } from "./factory/drop_down_list";
import { createRadioButtonGroup } from "./factory/radio_button_group";
import {
  createMultiSelect,
  createMultiItemSelect,
  createMultiValueSelect,
  createMultiTextSelect,
  createMultiBitSelect,
} from "./factory/multi_select";
import { createTreeSelect } from "./factory/tree_select";
import { createComboBox } from "./factory/combo_box";
import { createAutoComplete } from "./factory/autocomplete";
import { createTagAutoComplete } from "./factory/tag_auto_complete";
import { createButton } from "./factory/button";
import { createButtonGroup } from "./factory/buttonGroup";
import { createSelectButtonGroup } from "./factory/selectButtonGroup";
import {
  createDropDownButton,
  createMoreMenuButton,
} from "./factory/dropDownButton";
import { createSplitButton } from "./factory/splitButton";
import { createFloatingActionButton } from "./factory/floatingActionButton";
import {
  createIconVNode,
  MATERIAL_SYMBOL_PREFIX,
} from "@mmda/vui";
import Button from "primevue/button";
import Column from "primevue/column";
import DatePicker from "primevue/datepicker";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import Image from "primevue/image";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Menubar from "primevue/menubar";
import Menu from "primevue/menu";
import PanelMenu from "primevue/panelmenu";
import Paginator from "primevue/paginator";
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import MultiSelect from "primevue/multiselect";
import Tag from "primevue/tag";
import { primeLayout } from "./prime_layout";
import { createTree } from "./factory/tree";
import {
  applyPrimeColumnFilter,
  hydratePrimeColumnFilter,
  mergeFieldFilter,
} from "./prime_filter";

const EMPTY_SELECTION: unknown[] = [];

const invoke = (value: unknown) =>
  typeof value === "function" ? (value as () => unknown)() : value;

const listedFields = (metaUi: MetaUi) => {
  const fields = metaUi.getListedFields();
  return fields.length
    ? fields
    : metaUi.groups
        .filter((group) => !group.many)
        .flatMap((group) => group.fields);
};

const primeCellEditor = (
  field: MetaUiField,
  data: Record<string, unknown>,
) => {
  const name = field.fieldName;
  const onChange = (value: unknown) => {
    data[name] = value;
  };
  if (SqlDataType.isBool(field.dataType)) {
    return createCheckBox({
      checked: Boolean(data[name]),
      onChange,
    });
  }
  if (SqlDataType.isNum(field.dataType)) {
    return h(InputNumber as any, {
      modelValue: data[name],
      "onUpdate:modelValue": onChange,
    });
  }
  if (SqlDataType.isDate(field.dataType)) {
    return h(DatePicker as any, {
      modelValue: data[name],
      dateFormat: "yy-mm-dd",
      showTime: SqlDataType.isDateTime(field.dataType),
      "onUpdate:modelValue": onChange,
    });
  }
  return h(InputText as any, {
    modelValue: data[name],
    "onUpdate:modelValue": onChange,
  });
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
  const button = createButton;

  const table = <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) => {
    const fields = listedFields(metaUi);
    const editableFields = new Set(props.editableFields ?? []);
    const inplaceEdit =
      props.inplaceEdit === true && editableFields.size > 0;
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
      const hydrated = hydratePrimeColumnFilter(field, current);
      const state = reactive({
        ...hydrated,
        suggestions: [] as { label: string; value: unknown }[],
      });
      const apply = (filter?: EntityFieldFilter) => {
        return props.onFilterModelChange?.(
          mergeFieldFilter(filterModel, fieldName, filter),
        );
      };
      const ref = field.reference;
      const showSet =
        Boolean(ref?.isEnum || ref?.isRef || ref?.hasOne) &&
        !SqlDataType.isBool(field.dataType);
      const enumOptions = (ref?.refOptions ?? []).map((option) => ({
        label: ref!.labelOf(option),
        value: ref!.valueOf(option),
      }));
      const noValue = ["IS_NULL", "IS_NOT_NULL", "IS_ALL"].includes(
        state.operator ?? "",
      );
      const valueEditor = (which: "first" | "second") => {
        const isSecond = which === "second";
        const modelKey = isSecond ? "secondValue" : "value";
        if (SqlDataType.isDate(field.dataType)) {
          return h(DatePicker as any, {
            modelValue: state[modelKey],
            dateFormat: "yy-mm-dd",
            "onUpdate:modelValue": (value: any) => (state[modelKey] = value),
          });
        }
        if (SqlDataType.isNum(field.dataType)) {
          return h(InputNumber as any, {
            modelValue: state[modelKey],
            "onUpdate:modelValue": (value: number | null) =>
              (state[modelKey] = value),
          });
        }
        return h(InputText as any, {
          modelValue: state[modelKey],
          "onUpdate:modelValue": (value: string) => (state[modelKey] = value),
        });
      };
      const compareBlock = SqlDataType.isBool(field.dataType)
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
              options: getFieldFilterOps(field).map((op) => ({
                name: op,
                label: op,
              })),
              optionLabel: "label",
              optionValue: "name",
              "onUpdate:modelValue": (value: string) =>
                (state.operator = value),
            }),
            !noValue && valueEditor("first"),
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
            !noValue &&
              state.operator !== "BETWEEN" &&
              h(Select, {
                modelValue: state.joinOperator,
                options: [
                  { name: "AND", label: "AND" },
                  { name: "OR", label: "OR" },
                ],
                optionLabel: "label",
                optionValue: "name",
                "onUpdate:modelValue": (value: "AND" | "OR") =>
                  (state.joinOperator = value),
              }),
            !noValue &&
              state.operator !== "BETWEEN" &&
              valueEditor("second"),
          ]);
      const setBlock = !showSet
        ? undefined
        : ref?.hasOne && !ref.isEnum
          ? h(AutoComplete as any, {
              modelValue: state.setValues[0],
              suggestions: state.suggestions,
              optionLabel: "label",
              forceSelection: true,
              completeOnFocus: true,
              dropdown: true,
              placeholder: field.displayLabel,
              completeMethod: (event: { query: string }) => {
                void Promise.resolve(
                  props.searchRelative?.(field, event.query ?? ""),
                ).then((rows) => {
                  state.suggestions = (rows ?? []).map((option) => ({
                    label: String(ref.labelOf(option)),
                    value: ref.valueOf(option),
                  }));
                });
              },
              "onUpdate:modelValue": (value: any) => {
                const picked =
                  value && typeof value === "object" && "value" in value
                    ? value.value
                    : value;
                state.setValues = picked == null ? [] : [picked];
              },
            })
          : h(MultiSelect, {
              modelValue: state.setValues,
              options: enumOptions,
              optionLabel: "label",
              optionValue: "value",
              display: "chip",
              placeholder: field.displayLabel,
              "onUpdate:modelValue": (value: unknown[]) =>
                (state.setValues = value ?? []),
            });

      return h("div", { class: "mmda-prime-column-filter" }, [
        compareBlock,
        setBlock,
        h("div", { class: "mmda-prime-column-filter__actions" }, [
          h(Button, {
            icon: "pi pi-check",
            size: "small",
            text: true,
            ariaLabel: props.filterLabels?.apply ?? "Apply",
            onClick: () => apply(applyPrimeColumnFilter(field, state)),
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
      const editable =
        inplaceEdit &&
        editableFields.has(field.fieldName) &&
        !field.readOnly;
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
          ...(editable
            ? {
                editor: ({ data }: { data: T }) =>
                  primeCellEditor(field, data as Record<string, unknown>),
              }
            : {}),
        },
      );
    });

    const columns: VNode[] = [
      ...(props.rowDetail
        ? [
            h(Column, {
              expander: true,
              headerStyle: "width: 3rem",
            }),
          ]
        : []),
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

    const dataKey = metaUi.primaryKey ?? "id";
    const expandAll = props.rowDetail && props.rowDetail.expandAll !== false;
    const expandedRows = expandAll
      ? Object.fromEntries(
          model.map((row, index) => [
            String((row as any)?.[dataKey] ?? index),
            true,
          ]),
        )
      : {};

    const tableProps: Record<string, unknown> = {
      value: model,
      dataKey,
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
        return props.onSort?.(
          sorts.map((sort: any) => ({
            sortBy: sort.field,
            sortOrder: sort.order === -1 ? SortOrder.DESC : SortOrder.ASC,
          })),
        );
      },
      class: ["mmda-prime-table", props.class].filter(Boolean).join(" "),
    };

    if (inplaceEdit) {
      tableProps.editMode = "cell";
      tableProps.onCellEditInit = (event: any) => {
        const field = fields.find((item) => item.fieldName === event.field);
        const row = event.data as T;
        if (
          !field ||
          (props.canEditCell && !props.canEditCell(row, field))
        ) {
          event.preventDefault?.();
        }
      };
      tableProps.onCellEditComplete = (event: any) => {
        const field = fields.find((item) => item.fieldName === event.field);
        if (!field) return;
        const previous = event.data?.[event.field];
        const next = event.newValue;
        const allowed = props.onCellSave?.(
          event.data,
          field,
          next,
          previous,
        );
        if (allowed === false) {
          event.preventDefault?.();
          return;
        }
        if (event.data && event.field) {
          (event.data as any)[event.field] = next;
        }
      };
    }

    if (props.rowDetail) {
      tableProps.expandedRows = expandedRows;
      tableProps["onUpdate:expandedRows"] = (value: unknown) => {
        tableProps.expandedRows = value;
      };
    }

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
      expansion: props.rowDetail
        ? (slot: { data: T }) =>
            wrapRowDetail(props.rowDetail!.detail(slot.data))
        : undefined,
      default: () => columns,
    });
  };

  const factory: PrimeVueUiFactory = {
    layout: primeLayout,
    nativeInplaceEdit: true,
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
    badge: (props) => createBadge(props),
    avatar: (props) =>
      createAvatar(props, (name) => factory.resolveIcon(name)),
    barcode: (props) => createBarcode(props),
    qrCode: (props) => createQrCode(props),
    breadcrumb: (props) =>
      createBreadcrumb(props, (name) => factory.resolveIcon(name)),
    calendar: (props) => createCalendar(props),
    carousel: (props) => createCarousel(props),
    checkBox: (props) => createCheckBox(props),
    switch: (value, props) => createSwitch(switchArgs(value, props)),
    checkBoxList: (props) => createCheckBoxList(props),
    bitCheckBoxList: (props) => createBitCheckBoxList(props),
    chips: (props) =>
      createChips(props, (name) => factory.resolveIcon(name)),
    contextMenu: (props) =>
      createContextMenu(props, (name) => factory.resolveIcon(name)),
    card: (props, slots) => createCard(props, slots),
    divider: (props = {}) => createDivider(props),
    tooltip: (props = {}, slots) => createTooltip(props, slots),
    inplaceEditor: (props = {}, slots) => createInplaceEditor(props, slots),
    fileLink: (props = {}) => renderFileLink(props),
    Url: (props = {}) => renderFileLink(props),
    FileLink: (props = {}) => renderFileLink(props),
    fileUploader: (props = {}) => createFileUploader(props),
    filePicker: (props = {}) => createFileUploader(props),
    FileUploader: (props = {}) => createFileUploader(props),
    filesUploader: (props = {}) => createFilesUploader(props),
    fileUpload: (props = {}) => createFilesUploader(props),
    FileUpload: (props = {}) => createFilesUploader(props),
    imageUploader: (props = {}) => createImageUploader(props),
    imagePicker: (props = {}) => createImageUploader(props),
    ImagePicker: (props = {}) => createImageUploader(props),
    imagesUploader: (props = {}) => createImagesUploader(props),
    colorPicker: (props) => createColorPicker(props),
    maskedTextBox: (props) => createMaskedTextBox(props),
    oneTimePasswordInput: (props) => createOneTimePasswordInput(props),
    queryBuilder: (props) => createQueryBuilder(props),
    slider: (props) => createSlider(props),
    rating: (props) => createRating(props),
    tabs: (props) => createTabs(props),
    toolbar: (props, slots) => createToolbar(props, slots),
    sidebar: (props, slots) => createSidebar(props, slots),
    drawer: (props, slots) => createDrawer(props, slots),
    numberInput: (props) => createNumberInput(props),
    textInput: (props) => createTextInput(props),
    textArea: (props) => createTextArea(props),
    progressBar: (props) => createProgressBar(props),
    signaturePad: (props) => createSignaturePad(props),
    stepper: (props) =>
      createStepper(props, (name) => factory.resolveIcon(name)),
    timeline: (props) =>
      createTimeline(props, (name) => factory.resolveIcon(name)),
    skeleton: (props = {}) => createSkeleton(props),
    loading: (props = {}) => createLoading(props),
    speechToText: (props = {}) => createSpeechToText(props),
    datePicker: (props) => createDatePicker(props),
    monthPicker: (props) =>
      createDatePicker({
        ...props,
        precision: "month",
        format: props.format ?? "yyyy-MM",
      }),
    dateTimePicker: (props) => createDateTimePicker(props),
    timePicker: (props) => createTimePicker(props),
    dateRangePicker: (props) => createDateRangePicker(props),
    dropDownList: (props) => createDropDownList(props),
    radioButtonGroup: (props) => createRadioButtonGroup(props),
    multiSelect: (props) => createMultiSelect(props),
    multiItemSelect: (props) => createMultiItemSelect(props),
    multiValueSelect: (props) => createMultiValueSelect(props),
    multiTextSelect: (props) => createMultiTextSelect(props),
    multiBitSelect: (props) => createMultiBitSelect(props),
    treeSelect: createTreeSelect,
    dropDownTree: createTreeSelect,
    comboBox: (props) => createComboBox(props),
    title: (text, props) => h("h2", props, text),
    subtitle: (text, props) => h("h3", props, text),
    link: (props, slots) =>
      h(
        "a",
        { ...props, class: ["p-button p-button-link", props.class] },
        slots?.default?.() ?? props.text,
      ),
    iconField: (value, props = {}) =>
      h("span", { class: "p-input-icon-left" }, [
        props.icon && h("i", { class: factory.resolveIcon(props.icon) }),
        createTextInput({
          ...props,
          value: props.modelValue ?? value,
        }),
      ]),
    autoComplete: (value, props = {}) => createAutoComplete(value, props),
    tagAutoComplete: (value, props = {}) => createTagAutoComplete(value, props),
    button,
    buttonGroup: createButtonGroup,
    selectButtonGroup: createSelectButtonGroup,
    splitButton: createSplitButton,
    dropDownButton: createDropDownButton,
    moreMenuButton: createMoreMenuButton,
    floatingActionButton: createFloatingActionButton,
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
    tree: (props) => createTree(props),
    treeGrid: <T>(model: T[], metaUi: MetaUi, props: UiTreeGridPropsType<T>) => {
      if (props.rowDetail) {
        return table(model, metaUi, props as UiListPropsType<T>);
      }
      const fields = listedTableFields(metaUi);
      const { treeShape, shapeKey, idField, childrenKey, assembled } =
        assembleTreeGridRows(model, metaUi, {
          ...props,
          bindShape: props.bindShape ?? "nestedChildren",
        });
      const spec = { treeShape, shapeKey, idField };
      const kidsOf = (row: T): T[] => {
        const kids = (row as any)?.[childrenKey];
        return Array.isArray(kids) ? kids : [];
      };
      const toNodes = (rows: T[]): any[] =>
        rows.map((row) => ({
          key: treeRowId(row, spec),
          data: row,
          children: toNodes(kidsOf(row)),
          leaf:
            props.loadMode === "lazy"
              ? Number((row as any)?.[props.childrenCountKey ?? "childrenCount"] ?? 1) === 0
              : !kidsOf(row).length,
        }));
      return h(DataTable as any, {
        value: assembled.roots,
        dataKey: idField,
        class: ["mmda-prime-treegrid", props.class].filter(Boolean).join(" "),
        rowHover: true,
        onRowDblclick: (event: any) =>
          props.onItemDoubleClick?.(event.data?.data ?? event.data),
        onRowExpand: (event: any) => {
          const row = event.data?.data ?? event.data;
          if (row) void Promise.resolve(props.onExpand?.(row));
        },
      }, {
        default: () =>
          fields.map((field) =>
            h(Column, {
              field: field.fieldName,
              header: field.displayLabel,
              expander: field === fields[0],
              body: ({ data }: { data: any }) => {
                const row = data?.data ?? data;
                return props.renderCell?.(field, row) ?? String(row?.[field.fieldName] ?? "");
              },
            }),
          ),
      });
    },
    list: <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) =>
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
                        metaUi.primaryKey
                          ? (item as any)[metaUi.primaryKey]
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
      factory.table(loader.model.list as any[], metadata.metaUi, {
        ...props,
        pagination: props.pagination ?? loader.model.pagination,
        onPage: props.onPage,
      }),
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
    splitter: (panes, props) => createSplitter(panes, props),
    searchForRelative: (props) =>
      renderSearchForRelativeField(props as any),
    formField: (props = {}, slots) =>
      h(
        "div",
        { class: ["mmda-form-field", "mmda-prime-form-field", props.class], style: props.style },
        [
          props.label
            ? h("label", { class: "mmda-form-field__label" }, String(props.label))
            : null,
          slots?.default?.() ??
            createTextInput({
              ...props,
              value: props.modelValue ?? props.value,
              onChange:
                props.onChange ??
                props.onUpdate ??
                props["onUpdate:modelValue"],
            }),
        ],
      ),
  };

  wrapListFamilyPaginator(
    factory,
    ["list", "table", "treeGrid"],
    "mmda-prime-pagable",
  );
  bindListDisplayRenderers(factory);
  return factory;
}

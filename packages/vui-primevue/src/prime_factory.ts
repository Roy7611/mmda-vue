import { h, reactive, type VNode } from "vue";
import { DATE_RANGE_FILTER_KINDS, SqlDataType, SortOrder, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, getFieldFilterOps, fieldCellEditorAllowsColumn, resolveFieldCellCanEdit, unboxed, type FieldFilter, type FilterModel, type MetaUi, type MetaUiField } from "@mmda/core";
import type { VuiFactory, UiProps, UiAction, VuiListPropsType, UiPaginatorProps, VuiTileSlots, VuiTreeGridPropsType } from "@mmda/vui"
import { assembleTreeGridRows, treeRowId, bindListDisplayRenderers, wrapListFamilyPaginator, renderSearchForRelativeField, createFileUploader, createFilesUploader, createImageUploader, createImagesUploader, renderFileLink, wrapRowDetail, resolveActionButtonIcon, createErrorRetry, vuiUpdateOf } from "@mmda/vui"
import { createBadge } from "./factory/badge";
import { createMessage } from "./factory/message";
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
import { createMaskedTextBox } from "./factory/masked_text_box";
import { createOneTimePasswordInput } from "./factory/one_time_password_input";
import { createQueryBuilder } from "./factory/query_builder";
import { createSlider } from "./factory/slider";
import { createRating } from "./factory/rating";
import { createTabs } from "./factory/tabs";
import { createToolbar } from "./factory/toolbar";
import { createDrawer, createSidebar } from "./factory/sidebar";

type FormFieldProps = UiProps & {
  label?: string | VNode;
  modelValue?: string;
  value?: string;
  onChange?: (value: string) => void;
};

type IconFieldProps = UiProps & { icon?: string; modelValue?: string };
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
import { createButtonGroup } from "./factory/button_group";
import { createSelectButtonGroup } from "./factory/select_button_group";
import {
  createDropDownButton,
  createMoreMenuButton,
} from "./factory/drop_down_button";
import { createSplitButton } from "./factory/split_button";
import { createFloatingActionButton } from "./factory/floating_action_button";
import { createIconVNode, MATERIAL_SYMBOL_PREFIX } from "@mmda/vui"
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
import { primeVuiLayout } from "./prime_layout";
import { createTree } from "./factory/tree";
import {
  applyPrimeColumnFilter,
  hydratePrimeColumnFilter,
  mergeFieldFilter,
} from "./prime_filter";

const EMPTY_SELECTION: unknown[] = [];

const invoke = (value: unknown) =>
  typeof value === "function" ? (value as () => unknown)() : value;

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
  disabled: action.disabled === true,
  separator: action.divider,
  command: action.onAction,
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

export function createPrimeVuiFactory(): VuiFactory {
  const button = createButton;

  const table = <T>(props: VuiListPropsType<T> = {}) => {
    const model = (props.rows ?? []) as T[];
    const bag = props as VuiListPropsType<T> & {
      fieldCellRenderers?: Record<
        string,
        (field: MetaUiField, row: T) => unknown
      >;
      scrollable?: boolean;
      scrollHeight?: string | number;
      tableStyle?: unknown;
      size?: string;
      rowStyle?: unknown;
      selectedItems?: T[];
    };
    const fields = (props.fields ?? []) as MetaUiField[];
    const fieldEditors = bag.fieldCellEditors ?? {};
    const inplaceEdit = bag.editable === true;
    const selectionMode =
      props.selectionMode === "multiple"
        ? "multiple"
        : props.selectionMode === "single"
          ? "single"
          : undefined;
    const showColumnFilters =
      props.filterable !== false &&
      (props as { filterDisplay?: string }).filterDisplay === "row";
    const columnFilter = (field: MetaUiField) => {
      if (!showColumnFilters) return undefined;
      const filterModel = (props.filterModel ?? {}) as FilterModel;
      const fieldName = field.fieldName!;
      const current = filterModel[fieldName];
      const hydrated = hydratePrimeColumnFilter(field, current);
      const state = reactive({
        ...hydrated,
        suggestions: [] as { label: string; value: unknown }[],
      });
      const apply = (filter?: FieldFilter) => {
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
      const noValue = [
        "IS_NULL",
        "IS_NOT_NULL",
        "IS_BLANK",
        "IS_NOT_BLANK",
        "IS_ALL",
      ].includes(state.operator ?? "");
      const isWithin = state.operator === "WITHIN";
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
        : h("div", { class: "mmda-column-filter__values" }, [
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
            !noValue &&
              (isWithin
                ? h(Select, {
                    modelValue: state.dateKind,
                    options: DATE_RANGE_FILTER_KINDS.map((kind) => ({
                      name: kind,
                      label: props.dateRangeLabels?.[kind] ?? kind,
                    })),
                    optionLabel: "label",
                    optionValue: "name",
                    "onUpdate:modelValue": (value: string) =>
                      (state.dateKind = value as typeof state.dateKind),
                  })
                : valueEditor("first")),
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
              !isWithin &&
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
              !isWithin &&
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

      return h("div", { class: "mmda-column-filter" }, [
        compareBlock,
        setBlock,
        h("div", { class: "mmda-column-filter__actions" }, [
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
        const custom = bag.fieldCellRenderers?.[field.fieldName];
        if (custom) return custom(field, data);
        const value = (data as any)[field.fieldName];
        return field.reference?.refOptions?.length
          ? field.reference.labelOf(value)
          : String(value ?? "");
      };
      const editable =
        inplaceEdit &&
        !field.readOnly &&
        fieldCellEditorAllowsColumn(fieldEditors[field.fieldName]);
      return h(
        Column,
        {
          key: field.fieldName,
          field: field.fieldName,
          header: field.displayLabel,
          sortable:
            props.sortable === false
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
                  h("div", { class: "mmda-column-header" }, [
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

    const dataKey = props.primaryKey ?? "id";
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
      loading: unboxed(props.loading),
      resizableColumns: true,
      scrollable: bag.scrollable ?? true,
      scrollHeight:
        bag.scrollHeight ?? props.height ?? props.maxHeight ?? "flex",
      tableStyle: bag.tableStyle ?? { minWidth: "50rem" },
      size: bag.size ?? "small",
      onRowClick: (event: any) => props.onItemClick?.(event.data),
      onRowDblclick: (event: any) => props.onItemDoubleClick?.(event.data),
      onRowContextmenu: (event: any) => props.onItemContextMenu?.(event.data),
      rowStyle: bag.rowStyle,
      sortMode: props.sortable === false ? undefined : "multiple",
      onSort: (event: any) => {
        if (props.sortable === false) return;
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
      class: ["mmda-table", props.class].filter(Boolean).join(" "),
    };

    if (inplaceEdit) {
      tableProps.editMode = "cell";
      tableProps.onCellEditInit = (event: any) => {
        const field = fields.find((item) => item.fieldName === event.field);
        const row = event.data as T;
        if (
          !field ||
          field.readOnly ||
          (row as { editable?: boolean })?.editable === false ||
          !resolveFieldCellCanEdit(fieldEditors[field.fieldName], field, row)
        ) {
          event.preventDefault?.();
        }
      };
      tableProps.onCellEditComplete = (event: any) => {
        const field = fields.find((item) => item.fieldName === event.field);
        if (!field) return;
        const previous = event.data?.[event.field];
        const next = event.newValue;
        const onSave =
          fieldEditors[field.fieldName]?.onSave ?? bag.defaultCellSave;
        const allowed = onSave?.(field, event.data, next, previous);
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
      tableProps.selection = (bag.selectedItems ??
        EMPTY_SELECTION) as T[];
      tableProps.selectionMode = selectionMode;
      tableProps["onUpdate:selection"] = (value: T | T[]) => {
        const next = Array.isArray(value) ? value : value ? [value] : [];
        const current = (bag.selectedItems ?? EMPTY_SELECTION) as T[];
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

  const factory: VuiFactory = {
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
      print: "pi pi-print",
      execute: "pi pi-play",
      do: "pi pi-play",
      more: "pi pi-ellipsis-v",
      /** 详情页壳 cards ↔ tabs */
      "page-layout": "pi pi-th-large",
      "eye-slash": "pi pi-eye-slash",
      "dnd-vert": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "drag-indicator": `${MATERIAL_SYMBOL_PREFIX}drag_indicator`,
      "freeze-column-right": "pi pi-arrow-right",
      "freeze-column-left": "pi pi-arrow-left",
      unlock: "pi pi-lock-open",
      "align-left": "pi pi-align-left",
      "align-center": "pi pi-align-center",
      "align-right": "pi pi-align-right",
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
      if (!icon) return factory.actionIcons.execute;
      if (icon.startsWith("pi ")) return icon;
      if (/\bfa[srbld]?\b|fa-/.test(icon)) return icon;
      return factory.actionIcons[icon] ?? `pi pi-${icon}`;
    },
    textSpan: (props) => h("span", props, props.text),
    label: (props) => h("label", props, props.text),
    image: (props) => h(Image, { ...props, src: props.src, preview: props.preview }),
    icon: (props) =>
      createIconVNode(
        factory.resolveIcon(props.iconClass ?? ""),
        props as Record<string, unknown>,
      ),
    badge: (props) => createBadge(props),
    message: (props) => createMessage(props),
    avatar: (props) =>
      createAvatar(props, (name) => factory.resolveIcon(name)),
    barcode: (props) => createBarcode(props),
    qrCode: (props) => createQrCode(props),
    breadcrumb: (props) =>
      createBreadcrumb(props, (name) => factory.resolveIcon(name)),
    calendar: (props) => createCalendar(props),
    carousel: (props) => createCarousel(props),
    checkBox: (props) => createCheckBox(props),
    switch: (props) => createSwitch(props ?? {}),
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
    error: (props = {}) => createErrorRetry(props),
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
    title: (props) => h("h2", props, props.text),
    subtitle: (props) => h("h3", props, props.text),
    link: (props, slots) =>
      h(
        "a",
        { ...props, class: ["p-button p-button-link", props.class] },
        slots?.default?.() ?? props.text,
      ),
    iconField: (value, props = {}) => {
      const p = props as IconFieldProps;
      return h("span", { class: "p-input-icon-left" }, [
        p.icon && h("i", { class: factory.resolveIcon(p.icon) }),
        createTextInput({
          ...props,
          value: p.modelValue ?? value,
        }),
      ]);
    },
    autoComplete: (props = {}) => createAutoComplete(props),
    tagAutoComplete: (props = {}) => createTagAutoComplete(props),
    button,
    buttonGroup: (props = {}, slots) =>
      createButtonGroup(slots?.default ?? (() => []), props),
    selectButtonGroup: (props) =>
      createSelectButtonGroup(props.modelValue, props, factory.resolveIcon),
    splitButton: createSplitButton,
    dropDownButton: (props, slots) =>
      createDropDownButton(props, props.actions ?? [], slots),
    moreMenuButton: (props, slots) =>
      createMoreMenuButton(props, props.actions ?? [], slots),
    floatingActionButton: createFloatingActionButton,
    actionButton: (action, t, _resolve, props) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        ...props,
        icon: resolveActionButtonIcon(
          factory.resolveIcon,
          factory.actionIcons,
          action,
        ),
        onClick: action.onAction,
      }),
    paginator: (props: UiPaginatorProps) =>
      h(Paginator, {
        first: Math.max(
          0,
           ((props.pagination.pageNo ?? 1) - 1) *
             (props.pagination.pageSize ?? DEFAULT_PAGE_SIZE),
        ),
        rows: props.pagination.pageSize ?? DEFAULT_PAGE_SIZE,
        totalRecords: props.pagination.recordCount ?? 0,
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
    treeGrid: <T>(props: VuiTreeGridPropsType<T>) => {
      const model = (props.rows ?? []) as T[];
      if (props.rowDetail) {
        return table(props as VuiListPropsType<T>);
      }
      const fields = (props.fields ?? []) as MetaUiField[];
      const { treeShape, shapeKey, idField, childrenKey, assembled } =
        assembleTreeGridRows(model, { primaryKey: props.primaryKey } as MetaUi, {
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
        class: ["mmda-treegrid", props.class].filter(Boolean).join(" "),
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
    list: <T>(props: VuiListPropsType<T> = {}) =>
      h(
        DataView,
        { value: props.rows ?? [], layout: "list", class: "mmda-list" },
        {
          empty: () => props.empty?.() ?? "",
          list: ({ items }: { items: T[] }) =>
            h(
              "div",
              { class: "mmda-list__items" },
              items.map((item, index) =>
                h(
                  "article",
                  {
                    key:
                      props.itemKey?.(item) ??
                      String(
                        props.primaryKey
                          ? (item as any)[props.primaryKey]
                          : index,
                      ),
                    class: ["mmda-list__item", props.itemClass?.(item)],
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
    grid: table,
    pagableTable: (loader, metadata, props) =>
      factory.table({
        ...props,
        rows: loader.model.list as any[],
        fields: props.fields ?? metadata.getListedFields(),
        primaryKey: props.primaryKey ?? metadata.primaryKey,
        objName: props.objName ?? metadata.objName,
        pagination: props.pagination ?? loader.model.pagination,
        onPage: props.onPage,
      }),
    scrollbar: (content, props) =>
      h("div", { class: "mmda-scrollbar", ...props }, content as any),
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
    splitter: (props, slots) =>
      createSplitter(slots?.default?.() ?? [], props),
    searchRelative: (props) =>
      renderSearchForRelativeField(props as any),
    formField: (props = {}, slots) => {
      const p = props as FormFieldProps;
      return h(
        "div",
        { class: ["mmda-form-field", "mmda-form-field", p.class], style: p.style },
        [
          p.label
            ? h("label", { class: "mmda-form-field__label" }, String(p.label))
            : null,
          slots?.default?.() ??
            createTextInput({
              ...props,
              value: p.modelValue ?? p.value,
              onChange: p.onChange ?? vuiUpdateOf(props),
            }),
        ],
      );
    },
  };

  wrapListFamilyPaginator(
    factory,
    ["list", "table", "treeGrid"],
    "mmda-pagable",
  );
  bindListDisplayRenderers(factory);
  return factory;
}

import {
  createElement,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { GridComponent } from "@syncfusion/ej2-react-grids";
import "./grid_inject";
import {
  DefaultFieldFilter,
  FieldFilter,
  MetaUiFilterType,
  SqlDataType,
  SortOrder,
  fieldCellEditorAllowsColumn,
  hasBit,
  MetaUiField,
  resolveFieldCellCanEdit,
  type FieldFilter as FieldFilterModel,
  type FilterModel,
  type MetaUiFilterOpCode,
  type Sort,
  type UiAction,
  type UiGridProps,
  type UiTableProps,
} from "@mmda/core";
import { columnFreezeOf, isPersistableListColumn } from "./grid";
import { createPaginator } from "./navigation";
import { el, joinClass } from "./utils";

type TableDeps = {
  resolveIconCss?: (icon?: string) => string;
};

function columnWidth(field: MetaUiField): string | number {
  if (field.listSize != null && field.listSize > 0) return field.listSize;
  if (SqlDataType.isBool(field.dataType)) return 90;
  if (SqlDataType.isDate(field.dataType) || SqlDataType.isDateTime(field.dataType)) {
    return 150;
  }
  if (SqlDataType.isNum(field.dataType)) return 110;
  return 140;
}

function gridColumnType(field: MetaUiField): string {
  if (SqlDataType.isBool(field.dataType)) return "boolean";
  if (SqlDataType.isDateTime(field.dataType)) return "datetime";
  if (SqlDataType.isDate(field.dataType)) return "date";
  if (SqlDataType.isNum(field.dataType) && !field.reference) return "number";
  return "string";
}

function gridColumnFormat(field: MetaUiField): unknown {
  if (field.formatter != null && field.formatter !== "") return field.formatter;
  if (SqlDataType.isDateTime(field.dataType)) {
    return { type: "dateTime", format: "yyyy-MM-dd HH:mm:ss" };
  }
  if (SqlDataType.isDate(field.dataType)) {
    return { type: "date", format: "yyyy-MM-dd" };
  }
  return undefined;
}

function gridTextAlign(field: MetaUiField): string {
  const align = String(field.align ?? "").toLowerCase();
  if (align === "right" || align === "end") return "Right";
  if (align === "center") return "Center";
  if (align === "justify") return "Justify";
  if (
    field.reference?.isEnum ||
    field.reference?.isRef ||
    field.reference?.hasOne
  ) {
    return "Left";
  }
  if (SqlDataType.isNum(field.dataType)) return "Right";
  return "Left";
}

function columnEditType(field: MetaUiField): string {
  if (field.reference) return "dropdownedit";
  if (SqlDataType.isBool(field.dataType)) return "booleanedit";
  if (SqlDataType.isDateTime(field.dataType)) return "datetimepickeredit";
  if (SqlDataType.isDate(field.dataType)) return "datepickeredit";
  if (SqlDataType.isNum(field.dataType)) return "numericedit";
  return "defaultedit";
}

function displayCellValue(field: MetaUiField, row: unknown): ReactNode {
  const raw = (row as Record<string, unknown> | undefined)?.[field.fieldName];
  if (raw == null || raw === "") return field.nullDisplayText ?? "";
  if (field.reference) {
    const label = field.reference.labelOf?.(raw);
    if (label != null && label !== "") return String(label);
  }
  if (typeof raw === "boolean") return raw ? "是" : "否";
  return String(raw);
}

function cellTemplate(
  field: MetaUiField,
  renderer?: (field: MetaUiField, row: any) => ReactNode | ReactNode[] | undefined,
): (data: any) => ReactNode {
  return (data: any) => {
    const row = data?.taskData ?? data;
    const content = renderer
      ? renderer(field, row)
      : displayCellValue(field, row);
    if (content == null) return null;
    return el("div", { className: "mmda-cell" }, content);
  };
}

function actionColumn(
  props: UiTableProps<any, ReactNode>,
  resolveIconCss?: (icon?: string) => string,
): Record<string, unknown> {
  return {
    headerText: "",
    width: 120,
    allowSorting: false,
    allowFiltering: false,
    allowEditing: false,
    textAlign: "Right",
    template: (data: any) => {
      const row = data?.taskData ?? data;
      const actions = (props.rowActions?.(row) ?? []).filter(
        (item) => item.divider !== true,
      );
      return el(
        "div",
        { className: "mmda-row-actions" },
        ...actions.map((action: UiAction, index: number) =>
          el(
            "button",
            {
              key: action.id ?? action.name ?? index,
              type: "button",
              className: joinClass(
                "e-btn",
                "e-flat",
                action.colorRole === "danger" ? "e-danger" : undefined,
              ),
              title: action.tooltip ?? action.label,
              disabled: action.disabled === true,
              onClick: (event: any) => {
                event?.stopPropagation?.();
                action.onAction?.();
              },
            },
            action.icon
              ? el("span", {
                  className: resolveIconCss?.(action.icon) ?? action.icon,
                })
              : null,
            action.label ?? "",
          ),
        ),
      );
    },
  };
}

export function buildColumns(
  props: UiGridProps<any, ReactNode>,
  inplaceEdit: boolean,
  resolveIconCss?: (icon?: string) => string,
): Record<string, unknown>[] {
  const fields = (props.fields ?? []).filter((field) =>
    isPersistableListColumn(field.fieldName),
  );
  const columns = fields.map((field) => {
    const editable =
      inplaceEdit &&
      fieldCellEditorAllowsColumn(props.fieldCellEditors?.[field.fieldName]);
    const column: Record<string, unknown> = {
      field: field.fieldName,
      headerText: field.displayLabel ?? field.fieldName,
      width: columnWidth(field),
      textAlign: gridTextAlign(field),
      allowSorting: props.sortable !== false && field.sortable !== false,
      allowFiltering: props.filterable !== false,
      allowEditing: editable,
      allowResizing: true,
      freeze: columnFreezeOf(field),
    };
    const type = gridColumnType(field);
    if (type !== "string") column.type = type;
    if (SqlDataType.isBool(field.dataType)) column.displayAsCheckBox = true;
    const format = gridColumnFormat(field);
    if (format != null) column.format = format;
    if (editable) column.editType = columnEditType(field);
    const renderer = props.fieldCellRenderers?.[field.fieldName];
    if (renderer || field.reference) {
      column.template = cellTemplate(field, renderer);
    }
    return column;
  });
  if (props.showActionColumn !== false && props.rowActions) {
    columns.push(actionColumn(props, resolveIconCss));
  }
  return columns;
}

// —— EJ2 过滤谓词 → FilterModel（与 vui-syncfusion 同构的自用精简版）——

function resolveColumnFilterTypes(field: MetaUiField): number {
  return Number(field.filterTypes) || MetaUiField.inferColumnFilterType(field);
}

function simpleFilterTypeOf(field: MetaUiField): "text" | "number" | "date" {
  const types = resolveColumnFilterTypes(field);
  if (hasBit(types, MetaUiFilterType.DATE)) return "date";
  if (hasBit(types, MetaUiFilterType.NUMBER)) return "number";
  if (hasBit(types, MetaUiFilterType.TEXT)) return "text";
  const inferred = MetaUiField.inferColumnFilterType(field);
  if (inferred === MetaUiFilterType.DATE) return "date";
  if (inferred === MetaUiFilterType.NUMBER) return "number";
  return "text";
}

function gridFilterOperator(
  operator?: string,
  filterType?: "text" | "number" | "date",
): MetaUiFilterOpCode {
  const key = String(operator ?? "").toLowerCase();
  const operators: Record<string, MetaUiFilterOpCode> = {
    equal: "EQ",
    notequal: "NEQ",
    greaterthan: "GT",
    greaterthanorequal: "GE",
    lessthan: "LT",
    lessthanorequal: "LE",
    startswith: "STARTS_WITH",
    endswith: "ENDS_WITH",
    contains: "CONTAINS",
    doesnotcontain: "NOT_CONTAINS",
    isempty: "IS_BLANK",
    isnotempty: "IS_NOT_BLANK",
    isnull: filterType === "text" ? "IS_BLANK" : "IS_NULL",
    notnull: filterType === "text" ? "IS_NOT_BLANK" : "IS_NOT_NULL",
    isnotnull: filterType === "text" ? "IS_NOT_BLANK" : "IS_NOT_NULL",
    between: "BETWEEN",
    within: "WITHIN",
  };
  return operators[key] ?? "EQ";
}

function flattenFilterPredicates(predicates: unknown, parentJoin?: string): any[] {
  if (predicates == null) return [];
  const list = Array.isArray(predicates) ? predicates : [predicates];
  const items: any[] = [];
  for (const predicate of list) {
    if (Array.isArray(predicate?.predicates) && predicate.predicates.length) {
      const join = String(predicate.condition ?? parentJoin ?? "and").toLowerCase();
      items.push(...flattenFilterPredicates(predicate.predicates, join));
      continue;
    }
    if (predicate?.field) {
      items.push({
        field: predicate.field,
        operator: predicate.operator,
        value: predicate.value,
        predicate: predicate.predicate,
        join: parentJoin,
      });
    }
  }
  return items;
}

function flattenValues(items: any[]): unknown[] {
  return items.flatMap((item) =>
    Array.isArray(item.value) ? item.value : [item.value],
  );
}

function toSimpleFilter(item: any, field: MetaUiField): FieldFilterModel {
  const filterType = simpleFilterTypeOf(field);
  return {
    filterType,
    operator: gridFilterOperator(item.operator, filterType),
    value: item.value,
  };
}

function joinOperatorOf(items: any[]): "AND" | "OR" {
  return items.some((item) => String(item.join ?? "and").toLowerCase() === "or")
    ? "OR"
    : "AND";
}

function toCompareFilter(items: any[], field: MetaUiField): FieldFilterModel {
  if (items.length === 1) return toSimpleFilter(items[0], field);
  return {
    filterType: "join",
    operator: joinOperatorOf(items),
    conditions: items.map((item) => toSimpleFilter(item, field)),
  };
}

function resolveEnumFilterValues(field: MetaUiField, items: any[]): unknown[] {
  return flattenValues(items).map(
    (raw) =>
      DefaultFieldFilter.resolveValue(
        field,
        raw == null ? "" : String(raw),
      ) ?? raw,
  );
}

function enumCodesOf(field: MetaUiField): unknown[] {
  const reference = field.reference;
  if (!reference?.isEnum || !reference.valueOf) return [];
  return (reference.refOptions ?? [])
    .map((option) => reference.valueOf!(option))
    .filter((code) => code != null && code !== "");
}

function toEnumInFilter(items: any[], field: MetaUiField): FieldFilterModel {
  const operators = items.map((item) => String(item.operator ?? "").toLowerCase());
  const allNotEqual = operators.every(
    (op) => op === "notequal" || op === "notin",
  );
  const resolved = resolveEnumFilterValues(field, items);
  if (!allNotEqual) return FieldFilter.in(resolved);
  const excluded = new Set(resolved.map((value) => String(value)));
  const included = enumCodesOf(field).filter(
    (code) => !excluded.has(String(code)),
  );
  return FieldFilter.in(included);
}

function toSetFilter(items: any[], field: MetaUiField): FieldFilterModel {
  if (field.reference?.isEnum) return toEnumInFilter(items, field);
  const operators = items.map((item) => String(item.operator ?? "").toLowerCase());
  const allNotEqual = operators.every(
    (op) => op === "notequal" || op === "notin",
  );
  return {
    filterType: "set",
    operator: allNotEqual ? "NOT_IN" : "IN",
    values: flattenValues(items),
  };
}

function booleanFilterValueOf(value: unknown): boolean | null | undefined {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return undefined;
}

function isSetLikeOperator(operator: string): boolean {
  return ["equal", "in", "notequal", "notin"].includes(operator);
}

export function gridFiltersToModel(
  predicates: any[] | undefined,
  fields: MetaUiField[],
): FilterModel {
  const grouped = new Map<string, any[]>();
  for (const item of flattenFilterPredicates(predicates)) {
    const name = String(item.field);
    const list = grouped.get(name) ?? [];
    list.push(item);
    grouped.set(name, list);
  }

  const model: FilterModel = {};
  for (const [fieldName, items] of grouped) {
    const field = fields.find((value) => value.fieldName === fieldName);
    if (!field) continue;
    const operators = items.map((item) =>
      String(item.operator ?? "").toLowerCase(),
    );
    const simpleType = simpleFilterTypeOf(field);
    if (
      !hasBit(resolveColumnFilterTypes(field), MetaUiFilterType.BOOLEAN) &&
      simpleType === "text" &&
      operators.every((op) => op === "isnull")
    ) {
      model[fieldName] = { filterType: "text", operator: "IS_NULL" };
      continue;
    }
    if (hasBit(resolveColumnFilterTypes(field), MetaUiFilterType.BOOLEAN)) {
      const lastOp = String(items[items.length - 1]?.operator ?? "").toLowerCase();
      if (lastOp === "isnull") {
        model[fieldName] = { filterType: "boolean", value: null };
        continue;
      }
      const booleans = [
        ...new Set(
          flattenValues(items)
            .map(booleanFilterValueOf)
            .filter((value): value is boolean | null => value !== undefined),
        ),
      ];
      if (booleans.length === 1) {
        model[fieldName] = { filterType: "boolean", value: booleans[0] };
      }
      continue;
    }
    if (
      (field.reference?.isEnum ||
        field.reference?.isRef ||
        field.reference?.hasOne) &&
      operators.length &&
      operators.every((op) => isSetLikeOperator(op))
    ) {
      model[fieldName] = toSetFilter(items, field);
      continue;
    }
    const lower = items.find((item) =>
      ["greaterthan", "greaterthanorequal"].includes(
        String(item.operator ?? "").toLowerCase(),
      ),
    );
    const upper = items.find((item) =>
      ["lessthan", "lessthanorequal"].includes(
        String(item.operator ?? "").toLowerCase(),
      ),
    );
    if ((simpleType === "date" || simpleType === "number") && lower && upper) {
      model[fieldName] = {
        filterType: simpleType,
        operator: "BETWEEN",
        value: lower.value,
        valueTo: upper.value,
      };
      continue;
    }
    const setItems = items.filter((item) =>
      isSetLikeOperator(String(item.operator ?? "").toLowerCase()),
    );
    const compareItems = items.filter((item) => !setItems.includes(item));
    if (!compareItems.length && setItems.length) {
      model[fieldName] = toSetFilter(setItems, field);
      continue;
    }
    if (compareItems.length && setItems.length) {
      model[fieldName] = {
        filterType: "multi",
        filterModels: [
          toCompareFilter(compareItems, field),
          toSetFilter(setItems, field),
        ],
      };
      continue;
    }
    model[fieldName] = toCompareFilter(
      compareItems.length ? compareItems : items,
      field,
    );
  }
  return model;
}

// —— 宿主组件 ——

interface SfTableProps {
  props: UiGridProps<any, ReactNode>;
  resolveIconCss?: (icon?: string) => string;
}

function SfTable({ props, resolveIconCss }: SfTableProps): ReactElement {
  const gridRef = useRef<any>(null);
  const fields = (props.fields ?? []) as MetaUiField[];
  const inplaceEdit = props.editable === true;
  const fieldEditors = props.fieldCellEditors ?? {};

  const rowOf = (args: any): any => args?.data ?? args?.rowData;
  const rowAllowsEdit = (field: MetaUiField, row: any): boolean =>
    !field.readOnly &&
    row?.editable !== false &&
    resolveFieldCellCanEdit(fieldEditors[field.fieldName], field, row);
  const saveCellEdit = (
    field: MetaUiField,
    row: any,
    value: unknown,
    previousValue: unknown,
  ): boolean | void =>
    fieldEditors[field.fieldName]?.onSave?.(field, row, value, previousValue);

  const columns = useMemo(
    () => buildColumns(props, inplaceEdit, resolveIconCss),
    [props, inplaceEdit, resolveIconCss],
  );

  const selectionMode = props.selectionMode;
  const pagination = props.pagination;
  const grid = createElement(GridComponent as any, {
    dataSource: props.rows ?? [],
    columns,
    height: pagination ? "100%" : props.height,
    rowHeight:
      props.itemHeight === "small"
        ? 32
        : props.itemHeight === "large"
          ? 48
          : undefined,
    gridLines: props.showGridlines ? "Both" : "Default",
    allowPaging: false,
    allowSorting: props.sortable !== false,
    allowFiltering: props.filterable !== false,
    allowGrouping: props.groupable !== false && !pagination,
    allowResizing: true,
    allowSelection:
      Boolean(selectionMode) ||
      (inplaceEdit && props.inplaceEditStart === "excel"),
    selectionSettings: selectionMode
      ? {
          type: selectionMode === "multiple" ? "Multiple" : "Single",
          persistSelection: true,
        }
      : { type: "None" },
    editSettings: inplaceEdit
      ? {
          allowEditing: true,
          allowAdding: false,
          allowDeleting: false,
          mode: "Cell",
          showConfirmDialog: false,
        }
      : undefined,
    filterSettings:
      props.filterable !== false
        ? { type: props.filterDisplay === "row" ? "FilterBar" : "Menu" }
        : undefined,
    cssClass: joinClass("mmda-table", props.class),
    htmlAttributes: props.htmlAttributes,
    ref: (component: any) => {
      gridRef.current = component?.ej2Instances ?? component ?? null;
    },
    actionComplete: (args: any) => {
      if (args?.requestType === "sorting") {
        const sorts: Sort[] = (gridRef.current?.sortSettings?.columns ?? [])
          .filter((column: any) => column.field && column.direction)
          .map((column: any) => ({
            sortBy: column.field,
            sortOrder:
              column.direction === "Descending"
                ? SortOrder.DESC
                : SortOrder.ASC,
          }));
        void props.onSort?.(sorts);
        return;
      }
      if (args?.requestType === "filtering") {
        const model = gridFiltersToModel(
          gridRef.current?.filterSettings?.columns,
          fields,
        );
        void props.onFilterModelChange?.(model);
      }
    },
    cellEdit: (args: any) => {
      if (!inplaceEdit) return;
      const field = fields.find(
        (item) => item.fieldName === (args?.column?.field ?? args?.columnName),
      );
      const row = rowOf(args);
      if (!field || !row || !rowAllowsEdit(field, row)) args.cancel = true;
    },
    cellSave: (args: any) => {
      if (!inplaceEdit) return;
      const field = fields.find(
        (item) => item.fieldName === (args?.column?.field ?? args?.columnName),
      );
      const row = rowOf(args);
      if (!field || !row) return;
      if (saveCellEdit(field, row, args.value, args.previousValue) === false) {
        args.cancel = true;
      }
    },
    recordClick: (args: any) => {
      const field = fields.find(
        (item) => item.fieldName === (args?.column?.field ?? args?.columnName),
      );
      const row = rowOf(args);
      if (
        inplaceEdit &&
        field &&
        SqlDataType.isBool(field.dataType) &&
        row &&
        rowAllowsEdit(field, row)
      ) {
        const rowIndex =
          args?.rowIndex ??
          args?.rowIdx ??
          Number(args?.row?.getAttribute?.("data-rowindex") ?? NaN);
        if (Number.isFinite(rowIndex)) {
          gridRef.current?.editModule?.editCell?.(rowIndex, field.fieldName);
        }
      } else if (row) {
        props.onItemClick?.(row);
      }
    },
    recordDoubleClick: (args: any) => {
      const fieldName = args?.column?.field ?? args?.columnName;
      if (inplaceEdit && fieldName && fieldCellEditorAllowsColumn(fieldEditors[fieldName])) {
        return;
      }
      const row = rowOf(args);
      if (row) props.onItemDoubleClick?.(row);
    },
    rowSelected: (args: any) => {
      const row = rowOf(args);
      const selected = gridRef.current?.getSelectedRecords?.() ?? (row ? [row] : []);
      if (row) props.onItemSelect?.(row);
      if (selectionMode) {
        props.onSelect?.(selected, row);
        props.onSelectionChange?.(selected);
      }
    },
    dataBound: () => {
      if (props.rowDetail?.expandAll === false) return;
      queueMicrotask(() => {
        gridRef.current?.detailRowModule?.expandAll?.();
      });
    },
    ...(props.rowDetail
      ? {
          detailTemplate: (data: any) => {
            const row = data?.taskData ?? data;
            return el(
              "div",
              { className: "mmda-row-detail" },
              props.rowDetail?.detail?.(row),
            );
          },
        }
      : {}),
  });

  if (!pagination || props.pageable === false) return grid;
  return el(
    "div",
    { className: "mmda-pagable" },
    grid,
    createPaginator({
      pagination,
      pageSizeOptions: props.pageSizeOptions,
      class: props.class,
      onPage: (pager) => {
        void props.onPage?.(pager);
      },
    }),
  );
}

export function createTable<T>(
  props: UiTableProps<T, ReactNode>,
  deps: TableDeps = {},
): ReactNode {
  return createElement(SfTable, {
    props: props as UiGridProps<any, ReactNode>,
    resolveIconCss: deps.resolveIconCss,
  });
}

export function createGrid<T>(
  props: UiGridProps<T, ReactNode>,
  deps: TableDeps = {},
): ReactNode {
  return createTable(props, deps);
}

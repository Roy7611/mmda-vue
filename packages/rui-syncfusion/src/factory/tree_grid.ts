import {
  createElement,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  DetailRow,
  Edit,
  Filter,
  Resize,
  Sort,
  TreeGrid,
  TreeGridComponent,
} from "@syncfusion/ej2-react-treegrid";
import {
  SqlDataType,
  TREE_PARENT_KEY,
  detectChildrenKey,
  detectTreeSourceShape,
  fieldCellEditorAllowsColumn,
  resolveFieldCellCanEdit,
  treeDataProvider,
  treeIdField,
  type MetaUiField,
  type UiTreeGridProps,
} from "@mmda/core";
import { buildColumns, gridFiltersToModel } from "./table";
import { el, joinClass } from "./utils";

TreeGrid.Inject(Sort, Filter, Edit, Resize, DetailRow);

interface SfTreeGridProps {
  props: UiTreeGridProps<any, ReactNode>;
  resolveIconCss?: (icon?: string) => string;
}

function SfTreeGrid({ props, resolveIconCss }: SfTreeGridProps): ReactElement {
  const gridRef = useRef<any>(null);
  const model = props.rows ?? [];
  const fields = (props.fields ?? []) as MetaUiField[];
  const inplaceEdit = props.editable === true;
  const fieldEditors = props.fieldCellEditors ?? {};

  const treeShape = String(props.treeShape ?? "TREE");
  const shapeKey = props.shapeKey ?? "";
  const idField =
    props.idField ?? treeIdField(treeShape, shapeKey, props.primaryKey);
  const childrenKey = props.childrenKey ?? detectChildrenKey(model);
  const nested = detectTreeSourceShape(model, childrenKey) === "nested";
  const assembled = treeDataProvider.assemble(model, {
    treeShape,
    shapeKey,
    idField,
    sourceShape: nested ? "nested" : undefined,
    childrenKey,
  });
  const loadMode = props.loadMode ?? "full";

  const rowOf = (args: any): any =>
    args?.data?.taskData ?? args?.data ?? args?.rowData;
  const columnAllowsEdit = (fieldName: string): boolean =>
    fieldCellEditorAllowsColumn(fieldEditors[fieldName]);
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

  return createElement(TreeGridComponent as any, {
    dataSource: nested ? assembled.roots : assembled.rows,
    ...(nested
      ? { childMapping: childrenKey }
      : {
          idMapping: idField,
          parentIdMapping: TREE_PARENT_KEY,
          hasChildMapping: props.childrenCountKey ?? "childrenCount",
        }),
    columns,
    treeColumnIndex: 0,
    enableCollapseAll: loadMode === "full",
    allowPaging: false,
    allowSorting: props.sortable !== false,
    allowFiltering: props.filterable !== false,
    filterSettings:
      props.filterable !== false
        ? { type: props.filterDisplay === "row" ? "FilterBar" : "Menu" }
        : undefined,
    allowResizing: true,
    editSettings: inplaceEdit
      ? {
          allowEditing: true,
          allowAdding: false,
          allowDeleting: false,
          mode: "Cell",
        }
      : undefined,
    cssClass: joinClass("mmda-treegrid-table", props.class),
    ref: (component: any) => {
      gridRef.current = component?.ej2Instances ?? component ?? null;
    },
    expanding: (args: any) => {
      if (loadMode !== "lazy") return;
      void Promise.resolve(props.onExpand?.(args?.data as any));
    },
    actionComplete: (args: any) => {
      if (args?.requestType !== "filtering" || !props.onFilterModelChange) {
        return;
      }
      void props.onFilterModelChange(
        gridFiltersToModel(gridRef.current?.filterSettings?.columns, fields),
      );
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
      if (inplaceEdit && fieldName && columnAllowsEdit(fieldName)) return;
      const row = rowOf(args);
      if (row) props.onItemDoubleClick?.(row);
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
}

export function createTreeGrid<T>(
  props: UiTreeGridProps<T, ReactNode>,
  resolveIconCss?: (icon?: string) => string,
): ReactNode {
  return createElement(SfTreeGrid, { props, resolveIconCss });
}

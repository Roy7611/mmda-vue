import { h, render } from "vue";
import { SqlDataType, type MetaUi } from "@mmda/core";
import {
  TREE_PARENT_KEY,
  assembleTreeGridRows,
  listedTableFields,
  type UiTreeGridPropsType,
} from "@mmda/vui";
import { SfTreeGrid } from "../components/SfTreeGrid";
import {
  columnEditType,
  referenceEditParams,
  refreshReferenceEditParams,
} from "./utils";

export function attachTreeGridRenderer(factory: any) {
  factory.treeGrid = <T>(
    model: T[],
    metaui: MetaUi,
    props: UiTreeGridPropsType<T>,
  ) => {
    const fields = listedTableFields(metaui);
    const { idField, childrenKey, assembled } = assembleTreeGridRows(
      model,
      metaui,
      props,
    );
    const nested = assembled.sourceShape === "nested";
    const loadMode = props.loadMode ?? "full";
    const editableFields = new Set(props.editableFields ?? []);
    const inplaceEdit = props.inplaceEdit === true && editableFields.size > 0;
    const fieldByName = (name?: string) =>
      fields.find((item) => item.fieldName === name);
    const rowOf = (args: any) =>
      ((args?.data ?? args?.rowData) as { taskData?: T } | undefined)
        ?.taskData ?? (args?.data ?? args?.rowData);
    const columns = fields.map((field, index) => {
      const bool = SqlDataType.isBool(field.dataType);
      const listed = field.listSize && field.listSize > 0 ? field.listSize : 0;
      const canEdit =
        inplaceEdit && index > 0 && editableFields.has(field.fieldName);
      return {
        field: field.fieldName,
        headerText: field.displayLabel,
        width: index === 0
          ? Math.max(listed || 240, 200)
          : bool
            ? Math.min(
                listed || Math.max((field.displayLabel?.length ?? 2) * 14, 72),
                96,
              )
            : listed || undefined,
        minWidth: bool ? 64 : index === 0 ? 160 : 72,
        maxWidth: bool ? 96 : undefined,
        textAlign: bool ? "Center" : undefined,
        type: bool ? "boolean" : undefined,
        allowResizing: true,
        allowEditing: canEdit,
        editType: columnEditType(field),
        edit: canEdit ? referenceEditParams(field) : undefined,
      };
    });
    return h(SfTreeGrid, {
      options: {
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
        allowSorting: props.enableSort !== false,
        allowFiltering: false,
        allowResizing: props.resizableColumns !== false,
        editSettings: inplaceEdit
          ? {
              allowEditing: true,
              allowAdding: false,
              allowDeleting: false,
              mode: "Cell",
            }
          : undefined,
        cssClass: ["mmda-sf-treegrid-table", props.class]
          .filter(Boolean)
          .join(" "),
        expanding: (args: any) => {
          if (loadMode !== "lazy") return;
          void Promise.resolve(props.onExpand?.(args?.data as T));
        },
        cellEdit: (args: any) => {
          if (!inplaceEdit) return;
          const field = fieldByName(args?.column?.field ?? args?.columnName);
          const row = rowOf(args) as T | undefined;
          if (
            !field ||
            !editableFields.has(field.fieldName) ||
            props.canEditCell?.(row as T, field) === false
          ) {
            args.cancel = true;
            return;
          }
          refreshReferenceEditParams(args?.column, field);
        },
        cellSave: (args: any) => {
          if (!inplaceEdit) return;
          const field = fieldByName(args?.column?.field ?? args?.columnName);
          const row = rowOf(args) as T | undefined;
          if (!field || !row) return;
          if (
            props.onCellSave?.(row, field, args.value, args.previousValue) ===
            false
          ) {
            args.cancel = true;
          }
        },
        recordClick: (args: any) => {
          const row = rowOf(args) as T | undefined;
          if (row) props.onItemClick?.(row);
        },
        recordDoubleClick: (args: any) => {
          const fieldName = args?.column?.field ?? args?.columnName;
          if (inplaceEdit && fieldName && editableFields.has(fieldName)) return;
          const row = rowOf(args) as T | undefined;
          if (row) props.onItemDoubleClick?.(row);
        },
        queryCellInfo: (args: any) => {
          try {
            if (args?.cell?.classList?.contains("e-editedcell")) return;
            const field = fieldByName(args?.column?.field);
            if (!field || !args?.cell || !props.renderCell) return;
            const content = props.renderCell(field, rowOf(args) as T);
            if (content == null) return;
            const treeCell = args.cell.querySelector?.(
              ".e-treecell",
            ) as HTMLElement | null;
            const target = treeCell ?? args.cell;
            const isTreeCol = Boolean(treeCell);
            const host = document.createElement(isTreeCol ? "span" : "div");
            host.className = isTreeCol ? "mmda-sf-treecell" : "mmda-sf-cell";
            target.replaceChildren(host);
            render(
              h(
                isTreeCol ? "span" : "div",
                { class: host.className },
                content as any,
              ),
              host,
            );
          } catch {
            /* 单格失败不要把整表打成空 */
          }
        },
      },
    });
  };
}

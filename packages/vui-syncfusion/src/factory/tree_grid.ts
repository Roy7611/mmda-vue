import { getCurrentInstance, h, render, type VNode } from "vue";
import {
  SqlDataType,
  fieldCellEditorAllowsColumn,
  resolveFieldCellCanEdit,
  type MetaUi,
  type MetaUiField,
} from "@mmda/core";
import { TREE_PARENT_KEY, assembleTreeGridRows, listedTableFields, type UiTreeGridPropsType } from "@mmda/vui"
import { SfTreeGrid } from "../components/SfTreeGrid";
import { buildSfTreeGridColumns } from "../sf_grid_column";
import {
  refreshRefEditParams,
} from "./utils";

/** EJ2 queryCellInfo 里的 render() 不在组件树内，需带上建表时的 appContext。 */
function renderWithAppContext(
  vnode: VNode,
  host: Element,
  appContext: VNode["appContext"],
) {
  if (appContext) vnode.appContext = appContext;
  render(vnode, host);
}

export const treeGridRenderers = {
  treeGrid: <T>(
    model: T[],
    metaUi: MetaUi,
    props: UiTreeGridPropsType<T>,
  ) => {
    const appContext = getCurrentInstance()?.appContext ?? null;
    const fields = listedTableFields(metaUi);
    const { idField, childrenKey, assembled } = assembleTreeGridRows(
      model,
      metaUi,
      props,
    );
    const nested = assembled.sourceShape === "nested";
    const loadMode = props.loadMode ?? "full";
    const fieldEditors = props.fieldCellEditors ?? {};
    const inplaceEdit = props.editable === true;
    const fieldByName = (name?: string) =>
      fields.find((item) => item.fieldName === name);
    const rowOf = (args: any) =>
      ((args?.data ?? args?.rowData) as { taskData?: T } | undefined)
        ?.taskData ?? (args?.data ?? args?.rowData);
    const columnAllowsEdit = (fieldName: string) =>
      fieldCellEditorAllowsColumn(fieldEditors[fieldName]);
    const rowAllowsEdit = (field: MetaUiField, row: T) =>
      !field.readOnly &&
      (row as { editable?: boolean })?.editable !== false &&
      resolveFieldCellCanEdit(fieldEditors[field.fieldName], field, row);
    const saveCellEdit = (
      field: MetaUiField,
      row: T,
      value: unknown,
      previousValue: unknown,
    ) => {
      const onSave =
        fieldEditors[field.fieldName]?.onSave ??
        (props as { defaultCellSave?: typeof saveCellEdit }).defaultCellSave;
      return onSave?.(field, row, value, previousValue);
    };

    const columns = buildSfTreeGridColumns(metaUi, {
      allowSorting: props.sortable !== false,
      editable: inplaceEdit,
      fieldCellEditors: fieldEditors,
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
        allowSorting: props.sortable !== false,
        allowFiltering: false,
        allowResizing: true,
        // 官方单元格编辑：editSettings.mode = Cell
        // https://ej2.syncfusion.com/vue/documentation/treegrid/editing/cell-editing
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
        cellEdit(this: any, args: any) {
          if (!inplaceEdit) return;
          const field = fieldByName(args?.column?.field ?? args?.columnName);
          const row = rowOf(args) as T | undefined;
          if (!field || !row || !rowAllowsEdit(field, row)) {
            args.cancel = true;
            return;
          }
          refreshRefEditParams(args?.column, field);
        },
        cellSave(this: any, args: any) {
          if (!inplaceEdit) return;
          const field = fieldByName(args?.column?.field ?? args?.columnName);
          const row = rowOf(args) as T | undefined;
          if (!field || !row) return;
          if (
            saveCellEdit(field, row, args.value, args.previousValue) === false
          ) {
            args.cancel = true;
          }
        },
        recordClick(this: any, args: any) {
          const field = fieldByName(args?.column?.field ?? args?.columnName);
          const row = rowOf(args) as T | undefined;
          // 布尔列：单击进格（Cell 默认要双击）；displayAsCheckBox + booleanedit
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
            if (Number.isFinite(rowIndex) && this?.editModule?.editCell) {
              this.editModule.editCell(rowIndex, field.fieldName);
            }
          } else if (row) {
            props.onItemClick?.(row);
          }
        },
        recordDoubleClick(this: any, args: any) {
          const fieldName = args?.column?.field ?? args?.columnName;
          if (inplaceEdit && fieldName && columnAllowsEdit(fieldName)) return;
          const row = rowOf(args) as T | undefined;
          if (row) props.onItemDoubleClick?.(row);
        },
        ...(props.rowDetail
          ? {
              detailTemplate: "<div class=\"mmda-sf-row-detail-host\"></div>",
              detailDataBound(this: any, args: any) {
                const root = args?.detailElement as HTMLElement | undefined;
                const host =
                  (root?.querySelector?.(
                    ".mmda-sf-row-detail-host",
                  ) as HTMLElement | null) ?? root;
                if (!host) return;
                const row = rowOf(args) as T | undefined;
                if (!row) return;
                const content = props.rowDetail!.detail(row);
                renderWithAppContext(h("div", content as any), host, appContext);
              },
              dataBound(this: any) {
                if (props.rowDetail?.expandAll === false) return;
                queueMicrotask(() => {
                  this?.detailRowModule?.expandAll?.();
                });
              },
            }
          : {}),
        queryCellInfo(this: any, args: any) {
          try {
            if (args?.cell?.classList?.contains("e-editedcell")) return;
            const field = fieldByName(args?.column?.field) as
              | MetaUiField
              | undefined;
            if (!field || !args?.cell) return;
            const row = rowOf(args) as T;

            // 布尔可编列：交给 EJ2 displayAsCheckBox，勿用 Vue 盖掉
            if (
              SqlDataType.isBool(field.dataType) &&
              inplaceEdit &&
              columnAllowsEdit(field.fieldName)
            ) {
              if (!rowAllowsEdit(field, row)) {
                args.cell.replaceChildren();
              }
              return;
            }

            if (!props.renderCell && !props.fieldCellRenderers) return;
            const mapped = props.fieldCellRenderers?.[field.fieldName];
            const content = mapped
              ? mapped(field, row)
              : props.renderCell?.(field, row);
            if (content == null) return;
            const treeCell = args.cell.querySelector?.(
              ".e-treecell",
            ) as HTMLElement | null;
            const target = treeCell ?? args.cell;
            const isTreeCol = Boolean(treeCell);
            const host = document.createElement(isTreeCol ? "span" : "div");
            host.className = isTreeCol ? "mmda-sf-treecell" : "mmda-sf-cell";
            target.replaceChildren(host);
            renderWithAppContext(
              h(
                isTreeCol ? "span" : "div",
                { class: host.className },
                content as any,
              ),
              host,
              appContext,
            );
          } catch {
            /* 单格失败不要把整表打成空 */
          }
        },
      },
    });
  },
};

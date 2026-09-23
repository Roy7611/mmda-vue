import type { VNode } from "vue";
import {
  isNullObject,
  type MetaUiField,
  type UiFieldRenderer,
  type UiGroupRenderer,
} from "@mmda/core";
import type {UiProps} from "@mmda/core";

export type { UiFieldRenderer } from "@mmda/core";
/** 过渡名：皮肤与 vui 内部仍写 `UiFieldFactory`（core 的契约名）。 */
export type { UiFieldFactory } from "@mmda/core";

type VuiFieldRenderer = UiFieldRenderer<VNode>;

/** Vue 侧的组渲染器：core `UiGroupRenderer` 把泛型收到 `VNode`（context 用 core 的 `UiContext`）。 */
export type VuiGroupRenderer = UiGroupRenderer<VNode>


export const defineFieldProps = (field: MetaUiField): UiProps =>
  ({
    ".id": field.fieldName,
    ".name": field.fieldName,
    required: !field.nullable,
  }) as unknown as UiProps;

export const defineInputProps = (field: MetaUiField): UiProps =>
  ({
    ".id": field.fieldName,
    ".name": field.fieldName,
    maxlength: field.maxLength,
    required: !field.nullable,
    placeholder: field.placeholder,
  }) as unknown as UiProps;

/** 表格 cell renderer 不需要、也不应透传到 DOM 的 table 级 props */
export const TABLE_CELL_PROP_KEYS = [
  "groupUi",
  "cacheKey",
  "isSearch",
  "isTree",
  "readOnlyRows",
  "row",
  "group",
  "sortable",
  "showGridlines",
  "fieldCellRenderers",
  "renderCell",
  "templateCellFields",
  "tableMetaui",
  "onItemDoubleClick",
  "onSort",
  "selectionMode",
  "showColumnFilters",
  "empty",
  "loadingSlot",
  "onFilterModelChange",
  "filterModel",
  "filterModelOf",
  "filterLabels",
  "onSelect",
  "onSelectionChange",
  "selectedItems",
  "rowStyle",
  "rowClass",
  "striped",
  "stripedRows",
  "loading",
  "resizableColumns",
  "pagination",
  "pageSizeOptions",
  "onPage",
  "scrollable",
  "scrollHeight",
  "height",
  "maxHeight",
  "tableStyle",
  "size",
  "onRowClick",
  "onRowDblclick",
  "onRowContextmenu",
  "sortMode",
  "selection",
  "onUpdate:selection",
  "class",
  "value",
  "dataKey",
  "itemStyle",
  "itemClass",
  "itemKey",
  "onItemClick",
  "onItemSelect",
  "onSelectAll",
  "filterDisplay",
  "editable",
  "inplaceEditStart",
  "fieldCellEditors",
  "showActionColumn",
  "showActions",
  "rowActions",
  "itemHeight",
  "treeShape",
  "shapeKey",
  "idField",
  "parentIdField",
  "loadMode",
  "sourceShape",
  "bindShape",
  "childrenKey",
  "childrenCountKey",
  "onExpand",
  "pageable",
  "filterable",
  "groupable",
] as const;

export const cleanProps = (
  unwantedKeys: readonly string[],
  props: UiProps,
): UiProps => {
  if (!props || isNullObject(props)) return {};
  const cleaned = Object.assign({}, props) as Record<string, unknown>;
  for (const key of unwantedKeys) {
    delete cleaned[key];
  }
  return cleaned as UiProps;
};

/** 构造列级 cell renderer 时调用一次，勿在逐行循环里重复清理 */
export const cleanTableCellProps = (props: UiProps = {}): UiProps =>
  cleanProps(TABLE_CELL_PROP_KEYS, props);

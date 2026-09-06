import type { VNode } from "vue";
import {
  isNullObject,
  type MetaUiField,
  type MetaUiGroup,
} from "@mmda/core";
import type { PropData } from "../layout/layout";
import type { UiViewContext } from "../../contexts/view_context";

type UiContext = UiViewContext<any>;

export type UiFieldRenderer = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => VNode;
export type UiGroupRenderer = (
  group: MetaUiGroup,
  context: UiContext,
  children?: VNode[],
  props?: PropData,
) => VNode;

export interface UiFieldFactory extends Record<string, UiFieldRenderer> {
  fallbackDisplay: UiFieldRenderer;
  fallbackInput: UiFieldRenderer;
}

export const defineFieldProps = (field: MetaUiField): PropData => ({
  ".id": field.fieldName,
  ".name": field.fieldName,
  required: !field.nullable,
});

export const defineInputProps = (field: MetaUiField): PropData => ({
  ".id": field.fieldName,
  ".name": field.fieldName,
  maxlength: field.maxLength,
  required: !field.nullable,
  placeholder: field.placeholder,
});

/** 表格 cell renderer 不需要、也不应透传到 DOM 的 table 级 props */
export const TABLE_CELL_PROP_KEYS = [
  "groupUi",
  "cacheKey",
  "isSearch",
  "isTree",
  "readOnlyRows",
  "row",
  "group",
  "enableSort",
  "showGridlines",
  "renderCell",
  "templateCellFields",
  "tableMetaui",
  "onItemDoubleClick",
  "customCellRenderers",
  "onSort",
  "selectionMode",
  "showColumnFilters",
  "empty",
  "loadingSlot",
  "onFilterModelChange",
  "filterModel",
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
  "inplaceEdit",
  "inplaceEditStart",
  "editableFields",
  "canEditCell",
  "onCellSave",
  "showSummary",
  "showColumnWithAction",
  "showActions",
  "rowMenu",
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
  "enableGroup",
] as const;

export const cleanProps = (
  unwantedKeys: readonly string[],
  props: PropData,
): PropData => {
  if (!props || isNullObject(props)) return {};
  const cleaned = Object.assign({}, props) as PropData;
  for (const key of unwantedKeys) {
    delete cleaned[key];
  }
  return cleaned;
};

/** 构造列级 cell renderer 时调用一次，勿在逐行循环里重复清理 */
export const cleanTableCellProps = (props: PropData = {}): PropData =>
  cleanProps(TABLE_CELL_PROP_KEYS, props);

import type { VNode } from "vue";
import {
  isNullObject,
  type MetaUiField,
  type MetaUiGroup,
  type UiFieldFactory as CoreUiFieldFactory,
  type UiFieldRenderer,
} from "@mmda/core";
import type {UiProps} from "../layout/layout";
import type { VueUiContext } from "../../contexts/vue_ui_context";

export type { UiFieldRenderer } from "@mmda/core";

type UiContext = VueUiContext<any>;
type VueFieldRenderer = UiFieldRenderer<VNode>;

export type UiGroupRenderer = (
  group: MetaUiGroup,
  context: UiContext,
  children?: VNode[],
  props?: UiProps,
) => VNode;

/** core 字段工厂钉成 VNode；无额外方法。 */
export type VueUiFieldFactory = CoreUiFieldFactory<VNode>;

/** 过渡名：皮肤仍写 UiFieldFactory。 */
export interface UiFieldFactory extends VueUiFieldFactory {
  fallbackDisplay: VueFieldRenderer;
  fallbackInput: VueFieldRenderer;
  maskedTextBox?: VueFieldRenderer;
  oneTimePasswordInput?: VueFieldRenderer;
  slider?: VueFieldRenderer;
  rating?: VueFieldRenderer;
  mobileInput?: VueFieldRenderer;
  zipCodeInput?: VueFieldRenderer;
  numberInput?: VueFieldRenderer;
  percentInput?: VueFieldRenderer;
  positiveNumberInput?: VueFieldRenderer;
  negativenumberInput?: VueFieldRenderer;
  progressBar?: VueFieldRenderer;
  signaturePad?: VueFieldRenderer;
  stepper?: VueFieldRenderer;
  timeline?: VueFieldRenderer;
  radioButtonGroup?: VueFieldRenderer;
  imageUploader?: VueFieldRenderer;
  inplaceFieldEditor?: VueFieldRenderer;
  quantityUnit?: VueFieldRenderer;
  relativeTime?: VueFieldRenderer;
}

export const defineFieldProps = (field: MetaUiField): UiProps => ({
  ".id": field.fieldName,
  ".name": field.fieldName,
  required: !field.nullable,
});

export const defineInputProps = (field: MetaUiField): UiProps => ({
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
  const cleaned = Object.assign({}, props) as UiProps;
  for (const key of unwantedKeys) {
    delete cleaned[key];
  }
  return cleaned;
};

/** 构造列级 cell renderer 时调用一次，勿在逐行循环里重复清理 */
export const cleanTableCellProps = (props: UiProps = {}): UiProps =>
  cleanProps(TABLE_CELL_PROP_KEYS, props);

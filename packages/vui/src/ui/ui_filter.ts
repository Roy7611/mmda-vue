/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-09-18 19:15:16
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2026-04-24 13:57:53
 * @FilePath: /mmda-vue/packages/vui/src/ui/ui_filter.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  MetaUiField,
  SqlDataType,
  getFieldFilterOps,
  getSqlOperator,
  isArray,
  isNullOrUndefined,
} from "@mmda/core";
import type {
  MetaUiFilter,
  MetaUiFilterCondition,
  TranslateFn,
  UiContext,
  Pager,
  Pagination,
  SelectableFn,
  EntityFieldFilter,
  EntityFilterOperator,
} from "@mmda/core";

import type { PropData } from "./ui_layout";
import { ref, unref, type Ref, type VNode } from "vue";

export interface SearchForRelativeProps extends PropData {
  contentProps?: Record<string, any>;
  onUpdate?: (value: any) => void;
  modelValue: any;
  onSearch?: (params: any) => Promise<{ list: any; pager: Pagination }>;
  onSelect?: (selection: any[], row: any) => void;
  onRowDblclick?: (data: any, index: number) => void;
  toSearch?: (event: Event) => Promise<any>;
  accept?: () => Promise<boolean>;
  onHide?: () => Promise<boolean>;
  reject?: () => Promise<boolean>;
}
export interface SearchForRelativeContentProps extends PropData {
  selectableFn?: SelectableFn;
  onSearch?: (params: any) => Promise<{ list: any; pager: Pagination }>;
  onSelect?: (selection: any[], row: any) => void;
  onSelectAll?: (selection: any[], row: any) => void;
  onPage?: (pager: Pager) => void;
  onSort?: (sort: any) => void;
  /** 已选面板显示格式化函数，传入选中行数据返回显示文本，仅多选模式生效 */
  labelFn?: (item: any) => string;
}
// 流程图props
export interface FlowchartProps extends PropData {
  isToolBar?: boolean; //是否显示顶部按钮
  onGetData?: (data: string) => void;
  onGetNewBpmn?: (data: any) => void; // 获取bpmn初始化实例
}
export interface InputForRelativeProps extends SearchForRelativeProps {
  labelKey: string;
  valueKey: string;
  repository: string;
}

/** 搜索栏上的声明式额外条件（下拉、关联选择等）。 */
export interface CustomFilter {
  searchLabel: string;
  searchType: string;
  searchParam: string;
  selectOptions?: { label: string; value: string };
  optionList?: { label: string; value: any }[];
  selectProps?: {
    repository: string;
    queryParams?: Record<string, any>;
    refParamKeys?: string[];
    selectionMode?: "single" | "multiple";
    ctor: any;
  };
  valueKey?: string;
  selectIndex?: number;
}

export class UiFilter {
  selectedConditions: Ref<Array<MetaUiFilterCondition>>;

  constructor(readonly metaUiFilter: MetaUiFilter) {
    this.selectedConditions = ref([]);
  }

  get name() {
    return this.metaUiFilter.filterName;
  }
  get label() {
    return this.metaUiFilter.filterTitle;
  }

  get selectOptions() {
    return this.metaUiFilter.filterConditions;
  }

  get filtered() {
    return this.selectedConditions.value.length > 0;
  }
  toQuerySQL() {
    return `(${this.selectedConditions.value
      .map((c) => c.condition)
      .join(" OR ")})`;
  }

  toggle(condition: MetaUiFilterCondition, single = false) {
    const selected = this.selectedConditions.value;
    const active = selected.includes(condition);
    this.selectedConditions.value = active
      ? selected.filter((item) => item !== condition)
      : single
        ? [condition]
        : [...selected, condition];
  }
}

export function quickFiltersToSQL(filters: UiFilter[]) {
  const groups = filters
    .filter((filter) => filter.filtered)
    .map((filter) => filter.toQuerySQL());
  return groups.length ? groups.map((group) => `(${group})`).join(" AND ") : "";
}
export type UiCustomSearchRenderer = (
  context: UiContext,
  CustomSearchField: UiCustomSearchField,
  ...args: any[]
) => VNode;

export interface CustomSearchField {
  defaultValue?: any;
  searchLabel: string;
  searchParam: string;
  renderer: UiCustomSearchRenderer; // 渲染器
  valueFn?: (v: any | any[]) => any; // 取值函数
}
export class UiCustomSearchField {
  searchLabel: string;
  searchParam: string;
  renderer: UiCustomSearchRenderer; // 渲染器
  searchVal: Ref<any>;
  searchWord?: Ref<string | any>; // 远程搜索框的模糊搜索
  isComposing?: boolean; // 远程搜索是否开启输入法选词
  valueFn?: (v: any | any[]) => any;

  constructor(public readonly customField: CustomSearchField) {
    this.searchLabel = customField.searchLabel;
    this.searchParam = customField.searchParam;
    this.renderer = customField.renderer;
    this.searchVal = ref(customField.defaultValue ?? null);
    this.searchWord = ref();
    this.valueFn = customField.valueFn;
  }

  get hasVal() {
    const value = this.searchVal.value;
    if (isArray(value)) return value.length > 0;
    return !!value;
  }
  get searchValue() {
    if (this.valueFn) return this.valueFn(this.searchVal.value);
    return this.searchVal.value;
  }
}

export class UiSearchField {
  readonly availableOps: Array<EntityFilterOperator>;
  currentOp: EntityFilterOperator;
  currentOpLabel: Ref<string>;
  searchVal: Ref<any>;
  defaultVal: Ref<any>;
  searchWord?: any;
  isComposing?: boolean;
  valueFn?: (v: any | any[]) => any;

  constructor(
    public readonly field: MetaUiField,
    t: TranslateFn,
  ) {
    this.availableOps = getFieldFilterOps(field);
    this.currentOp = this.availableOps[0] ?? "EQ";
    this.currentOpLabel = ref(t(`matcher.${this.currentOp}`));
    this.searchVal = ref(null);
  }

  get hasVal() {
    const value = this.searchVal.value;
    if (isArray(value)) return value.length > 0;
    // return !!value;
    return !isNullOrUndefined(value);
  }
  get searchValue() {
    if (this.valueFn) return this.valueFn(this.searchVal.value);
    return this.searchVal.value;
  }

  changeCurrentOp(op: EntityFilterOperator, t?: TranslateFn) {
    this.currentOp = op;
    this.currentOpLabel.value = t ? t(`matcher.${op}`) : op;
    if (op === "IS_NULL" || op === "IS_NOT_NULL") {
      this.searchVal.value = op;
    }
  }

  toFilterModel(): EntityFieldFilter | undefined {
    const filterValue = this.hasVal ? this.searchValue : unref(this.defaultVal);
    const parameters = getSqlOperator(this.currentOp)?.parameters ?? 1;
    if (isNullOrUndefined(filterValue) && parameters !== 0) return undefined;
    const operator = this.currentOp;
    if (SqlDataType.isBool(this.field.dataType)) {
      if (operator === "IS_ALL") return undefined;
      return {
        filterType: "boolean",
        value:
          operator === "IS_TRUE"
            ? true
            : operator === "IS_FALSE"
              ? false
              : null,
      };
    }
    if (
      this.field.reference?.isEnum &&
      (operator === "IN" || operator === "NOT_IN")
    ) {
      return {
        filterType: "set",
        operator,
        values: isArray(filterValue) ? filterValue : [filterValue],
      };
    }
    const values =
      operator === "BETWEEN" && isArray(filterValue)
        ? filterValue
        : [filterValue, undefined];
    return {
      filterType: SqlDataType.isDate(this.field.dataType)
        ? "date"
        : SqlDataType.isNum(this.field.dataType)
          ? "number"
          : "text",
      operator,
      value: values[0],
      valueTo: values[1],
    };
  }
}

import {
  UiCustomSearchField,
  UiFilter,
  quickFiltersToSQL,
  type MetaUiFilter,
  type UiCustomSearchFieldOptions,
  type UiCustomSearchRenderer,
} from '@mmda/core'
import type {
  Pager,
  Pagination,
  SelectableFn,
  UiProps,
  UiSearchRefProps,
} from '@mmda/core'
import { h, ref, type VNode } from 'vue'

export { quickFiltersToSQL }

/** core UiFilter 的 Vue 侧收窄：`selectedConditions` 用 Vue `ref`。 */
export class VuiFilter extends UiFilter {
  constructor(metaUiFilter: MetaUiFilter) {
    super(metaUiFilter, (value) => ref(value))
  }
}

export type VuiCustomSearchRenderer = UiCustomSearchRenderer<VNode>

/** 业务声明自定义搜索字段；运行时包装成 {@link VuiCustomSearchField}。 */
export type CustomSearchField = UiCustomSearchFieldOptions<VNode>

/** core UiCustomSearchField 的 Vue 侧收窄：`searchVal` / `searchWord` 用 Vue `ref`。 */
export class VuiCustomSearchField extends UiCustomSearchField<VNode> {
  constructor(customField: CustomSearchField) {
    super(customField, (value) => ref(value))
  }
}

export interface SearchForRelativeProps extends UiSearchRefProps {
  contentProps?: Record<string, any>;
  onSearch?: (params: any) => Promise<{ list: any; pager: Pagination }>;
  onSelect?: (selection: any[], row: any) => void;
  onRowDblclick?: (data: any, index: number) => void;
  accept?: () => Promise<boolean>;
  onHide?: () => Promise<boolean>;
  reject?: () => Promise<boolean>;
}

export interface SearchForRelativeContentProps extends UiProps {
  selectableFn?: SelectableFn;
  onSearch?: (params: any) => Promise<{ list: any; pager: Pagination }>;
  onSelect?: (selection: any[], row: any) => void;
  onSelectAll?: (selection: any[], row: any) => void;
  onPage?: (pager: Pager) => void;
  onSort?: (sort: any) => void;
  /** 已选面板显示格式化函数，传入选中行数据返回显示文本，仅多选模式生效 */
  labelFn?: (item: any) => string;
}

/** 流程图 props。 */
export interface FlowchartProps extends UiProps {
  /** 是否显示顶部按钮。 */
  isToolBar?: boolean;
  onGetData?: (data: string) => void;
  /** 获取 bpmn 初始化实例。 */
  onGetNewBpmn?: (data: any) => void;
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
    selectionMode?: 'single' | 'multiple';
    ctor: any;
  };
  valueKey?: string;
  selectIndex?: number;
}

export function displaySearchForRelativeLabel(
  props: SearchForRelativeProps,
): string {
  const value = props.modelValue
  const optionLabel = (props as { optionLabel?: unknown }).optionLabel
  if (typeof optionLabel === 'function' && value != null) {
    return String(optionLabel(value) ?? '')
  }
  if (
    typeof optionLabel === 'string' &&
    value != null &&
    typeof value === 'object'
  ) {
    return String((value as Record<string, unknown>)[optionLabel] ?? '')
  }
  if (value == null) return ''
  if (typeof value === 'object') {
    const rec = value as Record<string, unknown>
    return String(rec.label ?? rec.name ?? rec.text ?? rec.id ?? '')
  }
  return String(value)
}

/** 关联选择字段 chrome：显示当前值，点选走 toSearch / context.select。不是 Dialog。 */
export function renderSearchForRelativeField(
  props: SearchForRelativeProps,
): VNode {
  const label = displaySearchForRelativeLabel(props)
  return h('span', { class: ['mmda-search-relative', props.class] }, [
    h('input', {
      class: 'mmda-search-relative__input',
      value: label,
      onInput: (event: Event) =>
        (props as { onInput?: (value: string) => void }).onInput?.(
          (event.target as HTMLInputElement).value,
        ),
      onClick: (event: Event) => void props.toSearch?.(event),
    }),
    h('button', {
      type: 'button',
      class: 'mmda-search-relative__pick',
      onClick: (event: Event) => void props.toSearch?.(event),
    }, '…'),
  ])
}

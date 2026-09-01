/**
 * 过滤器
 */
export interface MetaUiFilter{
  filterName: string;
  filterTitle: string;
  fixed: boolean;
  filterConditions: MetaUiFilterCondition[];
}
/**
 * 过滤条件
 */
export interface MetaUiFilterCondition {
  displayLabel: string;
  condition: string;
  fallback: boolean;
  /** 本机上次勾选；打开列表时优先于 fallback */
  active?: boolean;
}


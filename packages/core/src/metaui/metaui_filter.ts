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
  //active: boolean;
}


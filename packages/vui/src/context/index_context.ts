import type { Entity } from "@mmda/core";

/**
 * 索引上下文用于索引页交互逻辑（Logic）
 *
 */
export interface ListViewContext<E = Entity> {
  /** 显示设置 */

  /** 翻页 */

  /** 排序 */

  /** 模糊搜索 */

  /** 过滤 */

  /** 自定义查询 */

  /** 选择 */

  /** 删除 */

  /** 聚合统计 */

  /** 报表（多维分析） */

  /** 导航至详情 */

  /** 导航至创建和编辑 */

  /** 导入对话框 */

  /** 导出对话框 */

}


/**
 * 选择器上下文
 */
export class SelectorContext<E = Entity> implements ListViewContext<E> {

}

/**
 * 索引页上下文
 */
export class IndexPageContext<E = Entity> implements ListViewContext<E> {
  //https://ej2.syncfusion.com/vue/documentation/grid/filtering/filtering
  //https://www.ag-grid.com/vue-data-grid/filtering-overview/
}


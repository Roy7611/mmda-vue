import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiTableProps } from './table'

/**
 * 桌面表默认开关（分页 / 虚拟滚动 / 过滤 / 进格编辑）。
 *
 * **不是** `UiViewType`。只挂 {@link UiGridProps}。
 * index 与默认 selector 走 table，不需要 scene；特殊 selector 才 `scene: 'selector'`。
 */
export type UiGridScene = 'index' | 'selector' | 'edit' | 'details'

/**
 * 某一列的原位编辑覆盖。挂在 {@link UiGridProps.fieldCellEditors} 上。
 *
 * 有 key **不是**「才能编」：`editable !== false` 时默认全列可进格；
 * 程序员关列写 `{ canEdit: false }`，或挂 `onSave`。
 *
 * @example
 * ```ts
 * factory.grid(rows, metaUi, {
 *   fieldCellEditors: {
 *     status: { canEdit: false },
 *     qty: {
 *       canEdit: (_field, row) => row.status === 'draft',
 *       onSave: (_field, row, value) => { row.qty = value },
 *     },
 *   },
 * })
 * ```
 */
export type UiFieldCellEditor<T = any> = {
  /**
   * `false` 关列；函数按行挡。
   * 缺省 true（仍受 metaui readOnly / 行 `editable` 约束）。
   */
  canEdit?: boolean | ((field: MetaUiField, row: T) => boolean)
  /**
   * 单元格保存。返回 `false` 表示拒绝这次改值。
   * 缺省由 Builder 写回。
   */
  onSave?: (
    field: MetaUiField,
    row: T,
    value: unknown,
    previousValue: unknown,
  ) => boolean | void
}

/** 列级 canEdit：缺省 true；`false` 关；函数返回 false 关。 */
export function resolveFieldCellCanEdit<T>(
  editor: UiFieldCellEditor<T> | undefined,
  field: MetaUiField,
  row: T,
): boolean {
  const can = editor?.canEdit
  if (can === false) return false
  if (typeof can === 'function') return can(field, row) !== false
  return true
}

/**
 * 列头 allowEditing 静态判定：`canEdit: false` 关列；函数延到 cellEdit。
 */
export function fieldCellEditorAllowsColumn(
  editor: UiFieldCellEditor | undefined,
): boolean {
  return editor?.canEdit !== false
}

/**
 * 进格 / 子表等需要 scene 的桌面表。`buildGrid` / `factory.grid` 用这个。
 *
 * 默认：`edit` / `details`。selector 跟 index 一样走 table，特殊情况才带 `scene`。
 * 继承 {@link UiTableProps}（四开关、`fieldCellRenderers` …）。
 *
 * 原位进格是默认：用 {@link UiGridProps.editable} 控整表；关列写 `fieldCellEditors`。
 */
export interface UiGridProps<T = any, TNode = any>
  extends UiTableProps<T, TNode> {
  /**
   * 表格场景，只改默认开关，不是会话 `view`。
   * `edit` 默认进格；`details` 只读子表；特殊 selector 才用 `'selector'`。
   */
  scene?: UiGridScene
  /**
   * 整表能不能进格。缺省 `true`（grid）。
   * `false` = 只读（details Builder 写 false）。不要再用 `inplaceEdit`。
   */
  editable?: boolean
  /**
   * 原位编辑启动方式（仅原生 Grid 生效）：
   * - `excel`：单击选中；键入可打印字符时进入并覆盖（子表默认）
   * - `click`：单击进入编辑
   * - `dblclick`：双击进入编辑
   */
  inplaceEditStart?: 'click' | 'dblclick' | 'excel'
  /**
   * 按字段覆盖原位编辑。有 key 不是白名单：默认全列可编，这里只关列或挂 onSave。
   */
  fieldCellEditors?: Record<string, UiFieldCellEditor<T>>
}

/**
 * 树形可编表。`buildTreeGrid` / `factory.treeGrid` 用这个。
 *
 * 树装配字段由 vui `tree_grid.ts` 扩展；core 定可编一族。
 * 缺省 `filterable: false`、`pageable` 按场景（子表全量常关分页）。
 */
export interface UiTreeGridProps<T = any, TNode = any>
  extends UiGridProps<T, TNode> {
  /** 元数据树形态：邻接表 / 层级。 */
  treeShape?: 'TREE' | 'HIERARCHY' | string
  shapeKey?: string
  idField?: string
  parentIdField?: string
  /** 子表全量用 `full`；index 默认 `lazy`。 */
  loadMode?: 'full' | 'lazy'
  childrenKey?: string
  childrenCountKey?: string
  onExpand?: (node: T) => void | Promise<void>
}

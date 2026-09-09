import { SqlDataType, columnFilterKindOf, fieldCellEditorAllowsColumn, hasFilterType, MetaUiFieldFilterType, resolveColumnFilterTypes, type MetaUi, type MetaUiField } from '@mmda/core'
import { gridFreezeOf, listedTableFields, type UiGridScene } from '@mmda/vui'
import {
  columnEditType,
  gridColumnFormat,
  gridColumnType,
  gridTextAlign,
  listedFields,
  referenceEditParams,
} from './factory/utils'

export type SfGridScene = UiGridScene

/** scene 默认开关（显式 props 覆盖）。 */
export function sfGridSceneDefaults(scene: SfGridScene) {
  switch (scene) {
    case 'index':
    case 'selector':
      return {
        allowPaging: true,
        enableVirtualization: true,
        allowSorting: true,
        allowMultiSorting: true,
        allowFiltering: true,
        allowEditing: false,
        selectionMode: scene === 'selector' ? ('multiple' as const) : ('single' as const),
        persistLayout: true,
      }
    case 'edit':
      return {
        allowPaging: false,
        enableVirtualization: false,
        allowSorting: false,
        allowMultiSorting: false,
        allowFiltering: false,
        allowEditing: true,
        selectionMode: 'single' as const,
        persistLayout: false,
      }
    case 'details':
      return {
        allowPaging: false,
        enableVirtualization: false,
        allowSorting: true,
        allowMultiSorting: true,
        allowFiltering: false,
        allowEditing: false,
        selectionMode: 'single' as const,
        persistLayout: true,
      }
  }
}

/**
 * EJ2 列头 filter 配置（由 MetaUiField.filterTypes 决定）。
 * 完整 Menu/Excel 自定义 UI 仍在 factory.table；此处给契约 SfGrid 用标准类型。
 */
export function sfGridColumnFilterOf(field: MetaUiField) {
  switch (columnFilterKindOf(field)) {
    case 'boolean':
      return { type: 'Menu' as const }
    case 'range':
      return { type: 'Menu' as const }
    case 'set':
      return { type: 'CheckBox' as const }
    case 'multi':
      return { type: 'Excel' as const }
    case 'text':
    default:
      return { type: 'Menu' as const }
  }
}

export function sfGridColumnOf(
  field: MetaUiField,
  options: {
    allowFiltering?: boolean
    allowSorting?: boolean
    allowEditing?: boolean
  } = {},
) {
  const freeze = gridFreezeOf(field)
  const types = resolveColumnFilterTypes(field)
  return {
    field: field.fieldName,
    headerText: field.displayLabel,
    type: gridColumnType(field),
    format: gridColumnFormat(field),
    textAlign: gridTextAlign(field),
    headerTextAlign: gridTextAlign(field),
    width: field.listSize && field.listSize > 0 ? field.listSize : 120,
    visible: field.listed !== false,
    freeze: freeze === 'Left' ? 'Left' : freeze === 'Right' ? 'Right' : undefined,
    allowSorting:
      options.allowSorting !== false && field.sortable !== false,
    allowFiltering: options.allowFiltering !== false,
    allowEditing:
      options.allowEditing === true && field.readOnly !== true,
    isPrimaryKey: field.primaryKey === true,
    filter:
      options.allowFiltering === false
        ? undefined
        : sfGridColumnFilterOf(field),
    /** 皮肤内部：解析后的位掩码，便于调试 / 映射 */
    mmdaFilterTypes: types,
    mmdaAllowJoin: hasFilterType(types, MetaUiFieldFilterType.JOIN),
  }
}

export function buildSfGridColumns(
  metaUi: MetaUi,
  options: {
    allowFiltering?: boolean
    allowSorting?: boolean
    allowEditing?: boolean
  } = {},
) {
  return listedFields(metaUi).map(field => sfGridColumnOf(field, options))
}

export type SfTreeGridColumnOptions = {
  allowSorting?: boolean
  /** 与 factory.treeGrid 的 editable + fieldCellEditors 对齐 */
  editable?: boolean
  fieldCellEditors?: Record<string, { canEdit?: boolean | ((...args: any[]) => boolean) }>
  /** 树缩进列下标，默认 0 */
  treeColumnIndex?: number
}

/**
 * TreeGrid 列：先走 {@link sfGridColumnOf}，再覆写树表差异
 * （树列宽、布尔复选框、Cell 编辑参数；本轮关闭列头过滤）。
 */
export function sfTreeGridColumnOf(
  field: MetaUiField,
  index: number,
  options: SfTreeGridColumnOptions = {},
) {
  const treeColumnIndex = options.treeColumnIndex ?? 0
  const inplaceEdit = options.editable === true
  const canEdit =
    inplaceEdit &&
    index !== treeColumnIndex &&
    field.readOnly !== true &&
    fieldCellEditorAllowsColumn(options.fieldCellEditors?.[field.fieldName])
  const bool = SqlDataType.isBool(field.dataType)
  const listed = field.listSize && field.listSize > 0 ? field.listSize : 0

  const base = sfGridColumnOf(field, {
    allowFiltering: false,
    allowSorting: options.allowSorting,
    allowEditing: canEdit,
  })

  return {
    ...base,
    allowFiltering: false,
    filter: undefined,
    width:
      index === treeColumnIndex
        ? Math.max(listed || 240, 200)
        : bool
          ? Math.min(
              listed || Math.max((field.displayLabel?.length ?? 2) * 14, 72),
              96,
            )
          : listed || undefined,
    minWidth: bool ? 64 : index === treeColumnIndex ? 160 : 72,
    maxWidth: bool ? 96 : undefined,
    textAlign: bool ? ('Center' as const) : base.textAlign,
    headerTextAlign: bool ? ('Center' as const) : base.headerTextAlign,
    // 官方：boolean 列 + displayAsCheckBox；editType=booleanedit
    // https://ej2.syncfusion.com/vue/documentation/treegrid/editing/edit-types
    displayAsCheckBox: bool || undefined,
    allowResizing: true,
    allowEditing: canEdit,
    editType: columnEditType(field),
    edit: canEdit ? referenceEditParams(field) : undefined,
  }
}

/** 字段列表与现网 tree-grid 一致：{@link listedTableFields}。 */
export function buildSfTreeGridColumns(
  metaUi: MetaUi,
  options: SfTreeGridColumnOptions = {},
) {
  return listedTableFields(metaUi).map((field, index) =>
    sfTreeGridColumnOf(field, index, options),
  )
}

import { describe, expect, it } from 'vitest'
import { MetaUi, MetaUiField, SqlDataType } from '@mmda/core'
import {
  compareColumnVariantOf,
  createCompareColumnFilterStore,
  sfCompareColumnFilter,
} from '../factory/column_filter'
import {
  buildSfTreeGridColumns,
  sfGridColumnFilterOf,
  sfGridColumnOf,
  sfTreeGridColumnOf,
} from '../sf_grid_column'

const field = (
  init: ConstructorParameters<typeof MetaUiField>[0],
) => new MetaUiField(init)

const metauiOf = (...fields: MetaUiField[]) =>
  new MetaUi({
    objName: 'Node',
    displayLabel: '节点',
    primaryKey: 'id',
    groups: [
      {
        groupName: 'basic',
        groupLabel: '基础',
        many: false,
        fields,
      },
    ],
  })

describe('buildSfTreeGridColumns / sfTreeGridColumnOf', () => {
  it('reuses sfGridColumnOf baseline for text columns (format/textAlign) and disables filter', () => {
    const name = field({
      fieldIdx: 0,
      fieldName: 'name',
      displayLabel: '名称',
      dataType: SqlDataType.VARCHAR,
      nullable: true,
      listed: true,
    })
    const base = sfGridColumnOf(name, { allowFiltering: false })
    const col = sfTreeGridColumnOf(name, 1, {})
    expect(col.field).toBe('name')
    expect(col.type).toBe(base.type)
    expect(col.format).toBe(base.format)
    expect(col.textAlign).toBe(base.textAlign)
    expect(col.allowFiltering).toBe(false)
    expect(col.filter).toBeUndefined()
    expect(col.width).toBeUndefined()
  })

  it('bool columns get checkbox display, narrow width, and center align', () => {
    const enabled = field({
      fieldIdx: 1,
      fieldName: 'enabled',
      displayLabel: '启用',
      dataType: SqlDataType.BIT,
      nullable: true,
      listed: true,
    })
    const col = sfTreeGridColumnOf(enabled, 1, {
      editable: true,
    })
    expect(col.displayAsCheckBox).toBe(true)
    expect(col.textAlign).toBe('Center')
    expect(col.maxWidth).toBe(96)
    expect(col.minWidth).toBe(64)
    expect(col.allowEditing).toBe(true)
    expect(col.allowFiltering).toBe(false)
    expect(col.filter).toBeUndefined()
  })

  it('tree column is wider; only non-tree editable fields allow editing', () => {
    const title = field({
      fieldIdx: 0,
      fieldName: 'title',
      displayLabel: '标题',
      dataType: SqlDataType.VARCHAR,
      nullable: false,
      listed: true,
    })
    const status = field({
      fieldIdx: 1,
      fieldName: 'status',
      displayLabel: '状态',
      dataType: SqlDataType.VARCHAR,
      nullable: true,
      listed: true,
    })
    const cols = buildSfTreeGridColumns(metauiOf(title, status), {
      editable: true,
    })
    expect(cols).toHaveLength(2)
    expect(cols[0]!.width).toBeGreaterThanOrEqual(200)
    expect(cols[0]!.minWidth).toBe(160)
    expect(cols[0]!.allowEditing).toBe(false)
    expect(cols[1]!.allowEditing).toBe(true)
    expect(cols[1]!.editType).toBeTruthy()
  })

  it('reuses sfCompareColumnFilter for date/time/number when filtering is on', () => {
    const extras = {
      store: createCompareColumnFilterStore(),
    }
    const day = field({
      fieldIdx: 0,
      fieldName: 'day',
      displayLabel: '日期',
      dataType: SqlDataType.DATE,
      nullable: true,
      listed: true,
    })
    const at = field({
      fieldIdx: 1,
      fieldName: 'at',
      displayLabel: '时间',
      dataType: SqlDataType.TIME,
      nullable: true,
      listed: true,
    })
    const qty = field({
      fieldIdx: 2,
      fieldName: 'qty',
      displayLabel: '数量',
      dataType: SqlDataType.INT,
      nullable: true,
      listed: true,
    })
    expect(compareColumnVariantOf(day)).toBe('date')
    expect(compareColumnVariantOf(at)).toBe('time')
    expect(compareColumnVariantOf(qty)).toBe('number')

    const cols = buildSfTreeGridColumns(metauiOf(day, at, qty), {
      allowFiltering: true,
      filterExtras: extras,
    })
    const tableFilter = sfCompareColumnFilter(day, extras)
    expect(cols[0]!.allowFiltering).toBe(true)
    expect(cols[0]!.filter.ui.create).toBeTypeOf('function')
    expect(cols[0]!.filter.ui.read).toBeTypeOf('function')
    expect(sfGridColumnFilterOf(day, extras).ui.create).toBeTypeOf('function')
    expect(tableFilter.ui.create).toBeTypeOf('function')
    expect(cols[1]!.filter.ui.create).toBeTypeOf('function')
    expect(cols[2]!.filter.ui.create).toBeTypeOf('function')
  })
})

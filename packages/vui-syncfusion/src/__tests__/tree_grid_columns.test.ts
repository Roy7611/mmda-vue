import { describe, expect, it } from 'vitest'
import {
  MetaUi,
  MetaUiField,
  SqlDataType,
} from '@mmda/core'
import {
  buildSfTreeGridColumns,
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
})

import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import { MetaUiFilterType } from '../metaui/metaui_filter'
import {
  MetaUiField,
  getColumnFilterOps,
  hasFilterType,
  resolveColumnFilterTypes,
  simpleFilterTypeOf,
} from '../metaui/metaui_field'
import { createMockField } from './helpers/metaui_mock'

describe('列过滤算子表（getColumnFilterOps）', () => {
  it('文本列出比较算子，没有 IN / NOT_IN / BETWEEN', () => {
    const ops = getColumnFilterOps(
      createMockField({ filterTypes: MetaUiFilterType.TEXT }),
    )
    expect(ops).toEqual([
      'CONTAINS',
      'NOT_CONTAINS',
      'EQ',
      'NEQ',
      'STARTS_WITH',
      'ENDS_WITH',
      'IS_BLANK',
      'IS_NOT_BLANK',
    ])
    expect(ops).not.toContain('IN')
    expect(ops).not.toContain('BETWEEN')
  })

  it('数字 / 日期列才有 BETWEEN', () => {
    const numberOps = getColumnFilterOps(
      createMockField({
        dataType: SqlDataType.INT,
        filterTypes: MetaUiFilterType.NUMBER,
      }),
    )
    expect(numberOps).toContain('BETWEEN')
    expect(numberOps).not.toContain('CONTAINS')

    const dateOps = getColumnFilterOps(
      createMockField({
        dataType: SqlDataType.DATE,
        filterTypes: MetaUiFilterType.DATE,
      }),
    )
    expect(dateOps).toContain('BETWEEN')
    expect(dateOps).toContain('WITHIN')
  })

  it('纯集合列（枚举 / 引用 / hasOne）只有 IN / NOT_IN', () => {
    const enumField = createMockField({
      dataType: SqlDataType.INT,
      filterTypes: MetaUiFilterType.SET,
      selectOptions: 'ENUM Status(1,New|2,Done)',
    })
    expect(getColumnFilterOps(enumField)).toEqual(['IN', 'NOT_IN'])

    const refField = createMockField({
      dataType: SqlDataType.INT,
      filterTypes: MetaUiFilterType.SET,
      selectOptions: 'REF Warehouse(id,name)',
    })
    expect(getColumnFilterOps(refField)).toEqual(['IN', 'NOT_IN'])
  })

  it('比较位 + set 位同时在（multi 列）：两族合并', () => {
    const ops = getColumnFilterOps(
      createMockField({
        filterTypes: MetaUiFilterType.TEXT | MetaUiFilterType.SET,
      }),
    )
    expect(ops).toContain('CONTAINS')
    expect(ops.slice(-2)).toEqual(['IN', 'NOT_IN'])
  })

  it('布尔列只出是 / 否 / 空值', () => {
    const ops = getColumnFilterOps(
      createMockField({
        dataType: SqlDataType.BIT,
        filterTypes: MetaUiFilterType.BOOLEAN,
      }),
    )
    expect(ops).toEqual(['IS_TRUE', 'IS_FALSE', 'IS_NULL', 'IS_NOT_NULL'])
  })

  it('本地没写 filterTypes 时按字段推断', () => {
    expect(
      getColumnFilterOps(createMockField({ dataType: SqlDataType.INT })),
    ).toEqual(getColumnFilterOps(
      createMockField({
        dataType: SqlDataType.INT,
        filterTypes: MetaUiFilterType.NUMBER,
      }),
    ))
    expect(
      resolveColumnFilterTypes(createMockField({ dataType: SqlDataType.BIT })),
    ).toBe(MetaUiFilterType.BOOLEAN)
    expect(
      hasFilterType(
        createMockField({ dataType: SqlDataType.NVARCHAR }),
        MetaUiFilterType.TEXT,
      ),
    ).toBe(true)
  })

  it('simpleFilterTypeOf 只认比较类型', () => {
    expect(
      simpleFilterTypeOf(createMockField({ dataType: SqlDataType.TIMESTAMP })),
    ).toBe('date')
    expect(
      simpleFilterTypeOf(createMockField({ dataType: SqlDataType.DECIMAL })),
    ).toBe('number')
    expect(
      simpleFilterTypeOf(
        createMockField({
          dataType: SqlDataType.INT,
          selectOptions: 'ENUM Status(1,New|2,Done)',
        }),
      ),
    ).toBe('text')
  })

  it('静态推断能吃普通字段袋', () => {
    expect(
      getColumnFilterOps({ dataType: SqlDataType.NVARCHAR }),
    ).toContain('CONTAINS')
    expect(
      resolveColumnFilterTypes({ dataType: SqlDataType.DATE }),
    ).toBe(MetaUiField.inferColumnFilterType({ dataType: SqlDataType.DATE }))
  })
})

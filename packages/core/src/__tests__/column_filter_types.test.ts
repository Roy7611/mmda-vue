import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import {
  MetaUiFieldFilterType,
  columnFilterKindOf,
  hasFilterType,
  inferColumnFilterTypes,
  resolveColumnFilterTypes,
  simpleFilterTypeOf,
} from '../metaui/metaui_field'
import { createMockField } from './helpers/metaui_mock'

describe('MetaUiFieldFilterType / resolveColumnFilterTypes', () => {
  it('hasFilterType 位运算', () => {
    const types =
      MetaUiFieldFilterType.TEXT | MetaUiFieldFilterType.SET
    expect(hasFilterType(types, MetaUiFieldFilterType.TEXT)).toBe(true)
    expect(hasFilterType(types, MetaUiFieldFilterType.SET)).toBe(true)
    expect(hasFilterType(types, MetaUiFieldFilterType.DATE)).toBe(false)
    expect(hasFilterType(0, MetaUiFieldFilterType.TEXT)).toBe(false)

    const field = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes: MetaUiFieldFilterType.SET,
    })
    expect(hasFilterType(field, MetaUiFieldFilterType.SET)).toBe(true)
    expect(hasFilterType(field, MetaUiFieldFilterType.TEXT)).toBe(false)
  })

  it('NONE / 未配时按 dataType 推断', () => {
    const text = createMockField({ dataType: SqlDataType.VARCHAR })
    expect(inferColumnFilterTypes(text)).toBe(
      MetaUiFieldFilterType.TEXT |
        MetaUiFieldFilterType.SET |
        MetaUiFieldFilterType.MULTI,
    )
    expect(resolveColumnFilterTypes(text)).toBe(inferColumnFilterTypes(text))
    expect(columnFilterKindOf(text)).toBe('multi')

    const num = createMockField({ dataType: SqlDataType.INT })
    expect(resolveColumnFilterTypes(num)).toBe(MetaUiFieldFilterType.NUMBER)
    expect(columnFilterKindOf(num)).toBe('range')

    const bool = createMockField({ dataType: SqlDataType.BIT })
    expect(columnFilterKindOf(bool)).toBe('boolean')

    const date = createMockField({ dataType: SqlDataType.DATE })
    expect(columnFilterKindOf(date)).toBe('multi')
  })

  it('显式 filterTypes 覆盖推断', () => {
    const field = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes: MetaUiFieldFilterType.SET,
    })
    expect(resolveColumnFilterTypes(field)).toBe(MetaUiFieldFilterType.SET)
    expect(columnFilterKindOf(field)).toBe('set')
  })

  it('TEXT|SET 与 MULTI 都走 multi', () => {
    const combo = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes:
        MetaUiFieldFilterType.TEXT | MetaUiFieldFilterType.SET,
    })
    expect(columnFilterKindOf(combo)).toBe('multi')

    const multiFlag = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes: MetaUiFieldFilterType.MULTI | MetaUiFieldFilterType.TEXT,
    })
    expect(columnFilterKindOf(multiFlag)).toBe('multi')
  })

  it('BOOLEAN 优先于其它组合', () => {
    const field = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes:
        MetaUiFieldFilterType.BOOLEAN | MetaUiFieldFilterType.SET,
    })
    expect(columnFilterKindOf(field)).toBe('boolean')
  })

  it('simpleFilterTypeOf 读比较位', () => {
    const field = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes: MetaUiFieldFilterType.NUMBER,
    })
    expect(simpleFilterTypeOf(field)).toBe('number')
  })

  it('JOIN 不改变控件形态（比较槽能力）', () => {
    const field = createMockField({
      dataType: SqlDataType.VARCHAR,
      filterTypes:
        MetaUiFieldFilterType.TEXT | MetaUiFieldFilterType.JOIN,
    })
    expect(columnFilterKindOf(field)).toBe('text')
    expect(
      hasFilterType(
        resolveColumnFilterTypes(field),
        MetaUiFieldFilterType.JOIN,
      ),
    ).toBe(true)
  })
})

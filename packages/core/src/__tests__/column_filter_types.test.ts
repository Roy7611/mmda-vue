import { describe, expect, it } from 'vitest'
import { SqlDataType } from '../metaui/datatype'
import {
  MetaUiFieldFilterType,
  columnFilterKindOf,
  hasFilterType,
  inferColumnFilterTypes,
  isLazyChoiceFilterField,
  isRefOptionsComplete,
  resolveColumnFilterTypes,
  simpleFilterTypeOf,
} from '../metaui/metaui_filter'
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

  it('NONE / 未配时按 dataType 只给原生一位', () => {
    const text = createMockField({ dataType: SqlDataType.VARCHAR })
    expect(inferColumnFilterTypes(text)).toBe(MetaUiFieldFilterType.TEXT)
    expect(resolveColumnFilterTypes(text)).toBe(inferColumnFilterTypes(text))
    expect(columnFilterKindOf(text)).toBe('text')

    const num = createMockField({ dataType: SqlDataType.INT })
    expect(resolveColumnFilterTypes(num)).toBe(MetaUiFieldFilterType.NUMBER)
    expect(columnFilterKindOf(num)).toBe('range')

    const bool = createMockField({ dataType: SqlDataType.BIT })
    expect(columnFilterKindOf(bool)).toBe('boolean')

    const date = createMockField({ dataType: SqlDataType.DATE })
    expect(inferColumnFilterTypes(date)).toBe(MetaUiFieldFilterType.DATE)
    expect(columnFilterKindOf(date)).toBe('range')
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

  it('enum / ref 默认 SET（CheckBox），不要默认 TEXT Menu', () => {
    const enumerated = createMockField({
      selectOptions: 'OPEN;OPEN;打开|CLOSED;CLOSED;关闭',
    })
    expect(enumerated.reference?.isEnum).toBe(true)
    expect(inferColumnFilterTypes(enumerated)).toBe(MetaUiFieldFilterType.SET)
    expect(resolveColumnFilterTypes(enumerated)).toBe(MetaUiFieldFilterType.SET)
    expect(columnFilterKindOf(enumerated)).toBe('set')

    const refField = createMockField({
      selectOptions: 'REF Partner(id,partnerName)',
    })
    expect(refField.reference?.isRef).toBe(true)
    expect(inferColumnFilterTypes(refField)).toBe(MetaUiFieldFilterType.SET)
    expect(columnFilterKindOf(refField)).toBe('set')

    const leftoverText = createMockField({
      selectOptions: 'OPEN;OPEN;打开|CLOSED;CLOSED;关闭',
      filterTypes: MetaUiFieldFilterType.TEXT,
    })
    expect(resolveColumnFilterTypes(leftoverText)).toBe(MetaUiFieldFilterType.SET)
    expect(columnFilterKindOf(leftoverText)).toBe('set')
  })

  it('enum 显式 MULTI / JOIN 仍认叠加位', () => {
    const multi = createMockField({
      selectOptions: 'OPEN;OPEN;打开|CLOSED;CLOSED;关闭',
      filterTypes:
        MetaUiFieldFilterType.TEXT |
        MetaUiFieldFilterType.SET |
        MetaUiFieldFilterType.MULTI,
    })
    expect(columnFilterKindOf(multi)).toBe('multi')

    const join = createMockField({
      selectOptions: 'OPEN;OPEN;打开|CLOSED;CLOSED;关闭',
      filterTypes:
        MetaUiFieldFilterType.TEXT | MetaUiFieldFilterType.JOIN,
    })
    expect(columnFilterKindOf(join)).toBe('text')
    expect(
      hasFilterType(resolveColumnFilterTypes(join), MetaUiFieldFilterType.JOIN),
    ).toBe(true)
  })

  it('hasOne 默认 SET（CheckBox），裸 TEXT 也当 SET', () => {
    const hasOne = createMockField({
      selectOptions: 'HAS_ONE Material(matID,matName)',
    })
    expect(hasOne.reference?.hasOne).toBe(true)
    expect(inferColumnFilterTypes(hasOne)).toBe(MetaUiFieldFilterType.SET)
    expect(resolveColumnFilterTypes(hasOne)).toBe(MetaUiFieldFilterType.SET)
    expect(columnFilterKindOf(hasOne)).toBe('set')

    const leftoverText = createMockField({
      selectOptions: 'HAS_ONE Material(matID,matName)',
      filterTypes: MetaUiFieldFilterType.TEXT,
    })
    expect(resolveColumnFilterTypes(leftoverText)).toBe(MetaUiFieldFilterType.SET)
    expect(columnFilterKindOf(leftoverText)).toBe('set')
  })

  it('ref / hasOne 未穷尽懒加载，穷尽后本地', () => {
    const ref = createMockField({
      selectOptions: 'REF MaterialPackage(packID,packFullName)',
    })
    expect(isLazyChoiceFilterField(ref)).toBe(true)
    expect(isRefOptionsComplete(ref)).toBe(false)
    ref.reference!.refOptionsComplete = true
    expect(isRefOptionsComplete(ref)).toBe(true)
    expect(isLazyChoiceFilterField(ref)).toBe(false)

    const hasOne = createMockField({
      selectOptions: 'HAS_ONE Material(matID,matName)',
    })
    expect(isLazyChoiceFilterField(hasOne)).toBe(true)
    hasOne.reference!.refOptionsComplete = true
    expect(isLazyChoiceFilterField(hasOne)).toBe(false)
  })
})

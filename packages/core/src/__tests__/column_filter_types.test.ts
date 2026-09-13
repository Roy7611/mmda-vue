import { describe, expect, it } from 'vitest'
import { hasBit } from '../extensions/number_extensions'
import { SqlDataType } from '../metaui/datatype'
import {
  MetaUiFilterOperator,
  MetaUiFilterOperatorEnum,
  MetaUiFilterType,
  MetaUiFilterTypeEnum,
} from '../metaui/metaui_filter'
import { MetaUiField } from '../metaui/metaui_field'
import { createMockField } from './helpers/metaui_mock'

describe('MetaUiFilterType / inferColumnFilterType', () => {
  it('hasBit 与 ModuleOp 同一套', () => {
    const types = MetaUiFilterType.TEXT | MetaUiFilterType.SET
    expect(hasBit(types, MetaUiFilterType.TEXT)).toBe(true)
    expect(hasBit(types, MetaUiFilterType.SET)).toBe(true)
    expect(hasBit(types, MetaUiFilterType.DATE)).toBe(false)
    expect(hasBit(0, MetaUiFilterType.TEXT)).toBe(false)
  })

  it('nameOf / textOf / valueOf / hasFlag', () => {
    expect(MetaUiFilterTypeEnum.nameOf(MetaUiFilterType.DATE)).toBe('DATE')
    expect(MetaUiFilterTypeEnum.textOf(MetaUiFilterType.DATE)).toBe('date')
    expect(MetaUiFilterTypeEnum.nameOf(MetaUiFilterType.NONE)).toBe('NONE')
    expect(MetaUiFilterTypeEnum.textOf(MetaUiFilterType.NONE)).toBe('none')
    expect(MetaUiFilterTypeEnum.valueOf('set')).toBe(MetaUiFilterType.SET)
    expect(MetaUiFilterTypeEnum.valueOf('DATE')).toBe(MetaUiFilterType.DATE)
    expect(MetaUiFilterTypeEnum.valueOf('nope')).toBe(MetaUiFilterType.NONE)
    expect(
      MetaUiFilterTypeEnum.hasFlag(
        MetaUiFilterType.TEXT | MetaUiFilterType.SET,
        MetaUiFilterType.SET,
      ),
    ).toBe(true)
  })

  it('算子成员名 = JSON，值 = 控件名', () => {
    expect(MetaUiFilterOperator.EQ).toBe('equals')
    expect(MetaUiFilterOperator.STARTS_WITH).toBe('startsWith')
    expect(MetaUiFilterOperatorEnum.valueOf('eq')).toBe(MetaUiFilterOperator.EQ)
    expect(MetaUiFilterOperatorEnum.valueOf('STARTS_WITH')).toBe(
      MetaUiFilterOperator.STARTS_WITH,
    )
    expect(MetaUiFilterOperatorEnum.valueOf('nope')).toBeUndefined()
    expect(MetaUiFilterOperatorEnum.nameOf(MetaUiFilterOperator.BETWEEN)).toBe(
      'BETWEEN',
    )
    expect(MetaUiFilterOperatorEnum.textOf(MetaUiFilterOperator.BETWEEN)).toBe(
      'between',
    )
  })

  it('静态 infer 也能吃普通字段袋', () => {
    expect(
      MetaUiField.inferColumnFilterType({ dataType: SqlDataType.INT }),
    ).toBe(MetaUiFilterType.NUMBER)
  })

  it('infer：dataType + reference', () => {
    expect(
      createMockField({ dataType: SqlDataType.VARCHAR }).inferColumnFilterType(),
    ).toBe(MetaUiFilterType.TEXT)
    expect(
      createMockField({ dataType: SqlDataType.INT }).inferColumnFilterType(),
    ).toBe(MetaUiFilterType.NUMBER)
    expect(
      createMockField({ dataType: SqlDataType.BIT }).inferColumnFilterType(),
    ).toBe(MetaUiFilterType.BOOLEAN)
    expect(
      createMockField({ dataType: SqlDataType.DATETIME }).inferColumnFilterType(),
    ).toBe(MetaUiFilterType.DATE)
  })

  it('infer：enum / ref / hasOne → set', () => {
    const enumerated = createMockField({
      dataType: SqlDataType.VARCHAR,
      selectOptions: '0;OPEN;开|1;CLOSED;关',
    })
    expect(enumerated.inferColumnFilterType()).toBe(MetaUiFilterType.SET)

    const refField = createMockField({
      dataType: SqlDataType.INT,
      selectOptions: 'REF Warehouse(id,name)',
    })
    expect(refField.inferColumnFilterType()).toBe(MetaUiFilterType.SET)

    const hasOne = createMockField({
      dataType: SqlDataType.INT,
      selectOptions: 'HAS_ONE Person(id,name)',
    })
    expect(hasOne.inferColumnFilterType()).toBe(MetaUiFilterType.SET)
  })

  it('isRefOptionsFull：enum 恒 true；ref 看标记', () => {
    const enumerated = createMockField({
      dataType: SqlDataType.VARCHAR,
      selectOptions: '0;OPEN;开|1;CLOSED;关',
    })
    expect(enumerated.reference!.isRefOptionsFull).toBe(true)

    const refField = createMockField({
      dataType: SqlDataType.INT,
      selectOptions: 'REF Warehouse(id,name)',
    })
    expect(refField.reference!.isRefOptionsFull).toBe(false)
    refField.reference!.refOptionsComplete = true
    expect(refField.reference!.isRefOptionsFull).toBe(true)

    const hasOne = createMockField({
      dataType: SqlDataType.INT,
      selectOptions: 'HAS_ONE Person(id,name)',
    })
    expect(hasOne.reference!.isRefOptionsFull).toBe(false)
    hasOne.reference!.refOptionsComplete = true
    expect(hasOne.reference!.isRefOptionsFull).toBe(true)
  })
})

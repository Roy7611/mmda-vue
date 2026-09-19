import { describe, expect, it } from 'vitest'
import {
  MetaUiField,
  MetaUiFilterOperatorEnum,
  SqlDataType,
  defaultQueryBuilderOperators,
  queryBuilderColumnOf,
} from '@mmda/core'

const age = new MetaUiField({
  fieldIdx: 0,
  fieldName: 'age',
  displayLabel: 'Age',
  dataType: SqlDataType.INT,
  nullable: true,
})

const sport = new MetaUiField({
  fieldIdx: 1,
  fieldName: 'sport',
  displayLabel: 'Sport',
  dataType: SqlDataType.NVARCHAR,
  nullable: true,
})

describe('query builder columns', () => {
  it('uses MetaUiFilterOperatorEnum lists', () => {
    expect(defaultQueryBuilderOperators('text')).toEqual([
      ...MetaUiFilterOperatorEnum.textFilterOperators,
    ])
    expect(defaultQueryBuilderOperators('number')).toEqual([
      ...MetaUiFilterOperatorEnum.numberFilterOperators,
    ])
    expect(defaultQueryBuilderOperators('date')).toEqual([
      ...MetaUiFilterOperatorEnum.dateFilterOperators,
    ])
    expect(defaultQueryBuilderOperators('boolean')).toEqual([
      ...MetaUiFilterOperatorEnum.booleanFilterOperators,
    ])
  })

  it('text uses IS_BLANK, number uses IS_NULL', () => {
    expect(queryBuilderColumnOf(sport).operators).toContain('IS_BLANK')
    expect(queryBuilderColumnOf(sport).operators).not.toContain('IS_NULL')
    expect(queryBuilderColumnOf(age).operators).toContain('IS_NULL')
    expect(queryBuilderColumnOf(age).operators).not.toContain('IS_BLANK')
  })

  it('date columns include WITHIN', () => {
    const created = new MetaUiField({
      fieldIdx: 3,
      fieldName: 'createdAt',
      displayLabel: 'Created',
      dataType: SqlDataType.TIMESTAMP,
      nullable: true,
    })
    expect(queryBuilderColumnOf(created).operators).toContain('WITHIN')
  })
})

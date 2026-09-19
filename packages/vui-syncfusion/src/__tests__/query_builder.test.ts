import { describe, expect, it } from 'vitest'
import { MetaUiField, SqlDataType, queryBuilderColumnOf } from '@mmda/core'
import {
  advancedToQueryBuilderRule,
  queryBuilderRuleToAdvanced,
} from '../factory/ej2_query'

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

const country = new MetaUiField({
  fieldIdx: 2,
  fieldName: 'country',
  displayLabel: 'Country',
  dataType: SqlDataType.NVARCHAR,
  nullable: true,
})

describe('EJ2 query builder mapper', () => {
  it('maps nested OR/AND to AdvancedFilterModel and back', () => {
    const rule = {
      condition: 'and' as const,
      rules: [
        {
          condition: 'or' as const,
          rules: [
            { field: 'age', operator: 'greaterthan', value: 23, type: 'number' },
            { field: 'sport', operator: 'endswith', value: 'ing', type: 'string' },
          ],
        },
        { field: 'country', operator: 'contains', value: 'united', type: 'string' },
      ],
    }
    const model = queryBuilderRuleToAdvanced(rule)
    expect(model).toEqual({
      filterType: 'join',
      operator: 'AND',
      conditions: [
        {
          filterType: 'join',
          operator: 'OR',
          conditions: [
            {
              fieldName: 'age',
              filterType: 'number',
              operator: 'GT',
              value: 23,
            },
            {
              fieldName: 'sport',
              filterType: 'text',
              operator: 'ENDS_WITH',
              value: 'ing',
            },
          ],
        },
        {
          fieldName: 'country',
          filterType: 'text',
          operator: 'CONTAINS',
          value: 'united',
        },
      ],
    })
    const round = advancedToQueryBuilderRule(model, [
      queryBuilderColumnOf(age),
      queryBuilderColumnOf(sport),
      queryBuilderColumnOf(country),
    ])
    expect(queryBuilderRuleToAdvanced(round)).toEqual(model)
  })

  it('compacts a single rule group', () => {
    const model = queryBuilderRuleToAdvanced({
      condition: 'and',
      rules: [{ field: 'sport', operator: 'contains', value: 'ball', type: 'string' }],
    })
    expect(model).toEqual({
      fieldName: 'sport',
      filterType: 'text',
      operator: 'CONTAINS',
      value: 'ball',
    })
  })

  it('maps set IN and BETWEEN', () => {
    const inn = queryBuilderRuleToAdvanced({
      field: 'status',
      operator: 'in',
      value: ['OPEN', 'USED'],
      type: 'string',
    })
    expect(inn).toEqual({
      fieldName: 'status',
      filterType: 'set',
      operator: 'IN',
      values: ['OPEN', 'USED'],
    })
    const between = queryBuilderRuleToAdvanced({
      field: 'qty',
      operator: 'between',
      value: [10, 20],
      type: 'number',
    })
    expect(between).toEqual({
      fieldName: 'qty',
      filterType: 'number',
      operator: 'BETWEEN',
      value: 10,
      valueTo: 20,
    })
  })

  it('maps WITHIN + dateKind', () => {
    const created = new MetaUiField({
      fieldIdx: 3,
      fieldName: 'createdAt',
      displayLabel: 'Created',
      dataType: SqlDataType.TIMESTAMP,
      nullable: true,
    })
    const model = queryBuilderRuleToAdvanced({
      field: 'createdAt',
      operator: 'within',
      value: 'TODAY',
      type: 'date',
    })
    expect(model).toEqual({
      fieldName: 'createdAt',
      filterType: 'date',
      operator: 'WITHIN',
      value: 'TODAY',
    })
    expect(
      advancedToQueryBuilderRule(model, [queryBuilderColumnOf(created)]),
    ).toMatchObject({
      field: 'createdAt',
      operator: 'within',
      value: 'TODAY',
    })
  })

  it('maps isempty to IS_BLANK', () => {
    expect(
      queryBuilderRuleToAdvanced({
        field: 'sport',
        operator: 'isempty',
        type: 'string',
      }),
    ).toMatchObject({
      fieldName: 'sport',
      filterType: 'text',
      operator: 'IS_BLANK',
    })
  })
})

import { describe, expect, it } from 'vitest'
import { MetaUiField, SqlDataType, advancedToQueryBuilderRule, agAdvancedToEntity, entityToAgAdvanced, queryBuilderColumnOf, queryBuilderRuleToAdvanced } from '@mmda/core'

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

describe('query builder advanced filter mapper', () => {
  it('maps EJ2 nested OR/AND to AdvancedFilterModel and back', () => {
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
    expect(queryBuilderColumnOf(created).operators).toContain('WITHIN')
    expect(
      agAdvancedToEntity({
        filterType: 'date',
        colId: 'createdAt',
        type: 'TODAY',
      }),
    ).toEqual({
      fieldName: 'createdAt',
      filterType: 'date',
      operator: 'WITHIN',
      value: 'TODAY',
    })
    expect(
      entityToAgAdvanced({
        fieldName: 'createdAt',
        filterType: 'date',
        operator: 'WITHIN',
        value: 'THIS_MONTH',
      }),
    ).toMatchObject({
      colId: 'createdAt',
      type: 'THIS_MONTH',
    })
  })

  it('maps text blank to IS_BLANK and number blank to IS_NULL', () => {
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
    expect(
      queryBuilderColumnOf(sport).operators,
    ).toContain('IS_BLANK')
    expect(queryBuilderColumnOf(sport).operators).not.toContain('IS_NULL')
    expect(queryBuilderColumnOf(age).operators).toContain('IS_NULL')
    expect(queryBuilderColumnOf(age).operators).not.toContain('IS_BLANK')
    const ag = agAdvancedToEntity({
      filterType: 'text',
      colId: 'sport',
      type: 'blank',
    })
    expect(ag).toMatchObject({
      fieldName: 'sport',
      filterType: 'text',
      operator: 'IS_BLANK',
    })
    expect(entityToAgAdvanced(ag)).toMatchObject({
      colId: 'sport',
      type: 'blank',
    })
    expect(
      agAdvancedToEntity({
        filterType: 'number',
        colId: 'age',
        type: 'blank',
      }),
    ).toMatchObject({
      fieldName: 'age',
      filterType: 'number',
      operator: 'IS_NULL',
    })
  })

  it('maps AG AdvancedFilterModel camel operators', () => {
    const ag = {
      filterType: 'join' as const,
      type: 'AND' as const,
      conditions: [
        {
          filterType: 'number',
          colId: 'age',
          type: 'greaterThan',
          filter: 23,
        },
        {
          filterType: 'text',
          colId: 'country',
          type: 'contains',
          filter: 'united',
        },
      ],
    }
    const model = agAdvancedToEntity(ag)
    expect(model).toMatchObject({
      filterType: 'join',
      operator: 'AND',
    })
    expect(entityToAgAdvanced(model)).toMatchObject({
      filterType: 'join',
      type: 'AND',
      conditions: [
        { colId: 'age', type: 'greaterThan', filter: 23 },
        { colId: 'country', type: 'contains', filter: 'united' },
      ],
    })
  })
})

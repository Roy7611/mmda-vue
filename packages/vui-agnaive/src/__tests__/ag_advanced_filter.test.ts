import { describe, expect, it } from 'vitest'
import { agAdvancedToEntity, entityToAgAdvanced } from '../ag_advanced_filter'

describe('AG Advanced Filter mapper', () => {
  it('maps WITHIN + dateKind', () => {
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

  it('maps camel operators', () => {
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

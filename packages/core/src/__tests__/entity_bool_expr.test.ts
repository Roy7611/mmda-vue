import { describe, expect, it } from 'vitest'
import { parseEntityBoolExpression } from '../utils/entity_bool_expr'

describe('parseEntityBoolExpression', () => {
  it('empty is always true', () => {
    expect(parseEntityBoolExpression('')({ closed: true })).toBe(true)
    expect(parseEntityBoolExpression(null)({})).toBe(true)
  })

  it('reads boolean properties and ! && ||', () => {
    const can = parseEntityBoolExpression('editable && !closed')
    expect(can({ editable: true, closed: false })).toBe(true)
    expect(can({ editable: true, closed: true })).toBe(false)
    expect(can({ editable: false, closed: false })).toBe(false)
  })

  it('compares strings and numbers', () => {
    const draft = parseEntityBoolExpression("status=='draft'")
    expect(draft({ status: 'draft' })).toBe(true)
    expect(draft({ status: 'open' })).toBe(false)
    expect(parseEntityBoolExpression('qty>=10')({ qty: 10 })).toBe(true)
  })

  it('bad expression is false', () => {
    expect(parseEntityBoolExpression('status==')({})).toBe(false)
  })
})

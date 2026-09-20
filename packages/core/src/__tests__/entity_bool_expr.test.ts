import { describe, expect, it } from 'vitest'
import { parseEntityBoolExpression } from '../logic/entity_bool_expr'

describe('parseEntityBoolExpression', () => {
  it('empty is always true', () => {
    expect(parseEntityBoolExpression('')({ closed: true } as any)).toBe(true)
    expect(parseEntityBoolExpression(null)({} as any)).toBe(true)
  })

  it('reads boolean properties and ! && ||', () => {
    const can = parseEntityBoolExpression('editable && !closed')
    expect(can({ editable: true, closed: false } as any)).toBe(true)
    expect(can({ editable: true, closed: true } as any)).toBe(false)
    expect(can({ editable: false, closed: false } as any)).toBe(false)
  })

  it('compares strings and numbers', () => {
    const draft = parseEntityBoolExpression("status=='draft'")
    expect(draft({ status: 'draft' } as any)).toBe(true)
    expect(draft({ status: 'open' } as any)).toBe(false)
    expect(parseEntityBoolExpression('qty>=10')({ qty: 10 } as any)).toBe(true)
  })

  it('bad expression is false', () => {
    expect(parseEntityBoolExpression('status==')({} as any)).toBe(false)
  })
})

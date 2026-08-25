import { describe, expect, it } from 'vitest'
import { pluralize } from '../utils/pluralize'

describe('pluralize', () => {
  it('领域不规则词', () => {
    expect(pluralize('Equipment')).toBe('Equipments')
    expect(pluralize('Person')).toBe('Persons')
    expect(pluralize('ProjectSettlement')).toBe('Projectsettlements')
    expect(pluralize('I')).toBe('WE')
  })

  it('自定义规则与不可数', () => {
    expect(pluralize('regex')).toBe('regexii')
    expect(pluralize('paper')).toBe('paper')
  })

  it('常规英文复数仍走库默认', () => {
    expect(pluralize('Warehouse')).toBe('Warehouses')
  })
})

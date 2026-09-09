import { describe, expect, it } from 'vitest'
import { syncfusionChipCssClass } from '../factory/chips'

describe('syncfusionChipCssClass', () => {
  it('maps colorRole to EJ2 cssClass except secondary', () => {
    expect(syncfusionChipCssClass({ label: 'A', colorRole: 'success' })).toContain(
      'e-success',
    )
    expect(
      syncfusionChipCssClass({ label: 'A', colorRole: 'secondary' }),
    ).not.toContain('e-secondary')
    expect(
      syncfusionChipCssClass({ label: 'A', outlined: true }),
    ).toContain('e-outline')
  })
})

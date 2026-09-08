import { describe, expect, it } from 'vitest'
import { skeletonModifierClasses } from '../ui/factory/skeleton'

describe('skeleton chrome helpers', () => {
  it('defaults shape text and shimmer wave', () => {
    const classes = skeletonModifierClasses({})
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-skeleton')
    expect(classes).toContain('mmda-skeleton--text')
    expect(classes).toContain('mmda-skeleton--wave')
  })

  it('hooks circle and none shimmer', () => {
    const classes = skeletonModifierClasses({
      shape: 'circle',
      shimmer: 'none',
    })
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-skeleton--circle')
    expect(classes).toContain('mmda-skeleton--none')
  })
})

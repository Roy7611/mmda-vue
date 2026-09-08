import { describe, expect, it } from 'vitest'
import {
  LOADING_WIDTH_LARGE,
  LOADING_WIDTH_MEDIUM,
  LOADING_WIDTH_SMALL,
  loadingLabelOf,
  loadingModifierClasses,
  loadingNaiveSizeOf,
  loadingSizeOf,
  loadingWidthOf,
} from '../ui/factory/loading'

describe('loading chrome helpers', () => {
  it('defaults medium width and no size class', () => {
    expect(loadingSizeOf({})).toBeUndefined()
    expect(loadingWidthOf({})).toBe(LOADING_WIDTH_MEDIUM)
    expect(loadingNaiveSizeOf({})).toBe('medium')
    const classes = loadingModifierClasses({}).flat().filter(Boolean)
    expect(classes).toContain('mmda-loading')
    expect(classes).not.toContain('mmda-loading--small')
    expect(classes).not.toContain('mmda-loading--large')
  })

  it('maps small and large', () => {
    expect(loadingSizeOf({ size: 'small' })).toBe('small')
    expect(loadingWidthOf({ size: 'small' })).toBe(LOADING_WIDTH_SMALL)
    expect(loadingWidthOf({ size: 'large' })).toBe(LOADING_WIDTH_LARGE)
    expect(loadingNaiveSizeOf({ size: 'large' })).toBe('large')
  })

  it('hooks label class', () => {
    expect(loadingLabelOf({})).toBeUndefined()
    expect(loadingLabelOf({ label: '加载中' })).toBe('加载中')
    const classes = loadingModifierClasses({ label: '加载中' })
      .flat()
      .filter(Boolean)
    expect(classes).toContain('mmda-loading--labeled')
  })
})

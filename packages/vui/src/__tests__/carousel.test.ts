import { describe, expect, it } from 'vitest'
import {
  carouselBoundIndex,
  carouselSlideContent,
} from '../ui/factory/carousel'

describe('carousel contract helpers', () => {
  it('reads selectedIndex or modelValue', () => {
    expect(carouselBoundIndex({ items: [], selectedIndex: 2 })).toBe(2)
    expect(carouselBoundIndex({ items: [], modelValue: 3 })).toBe(3)
  })

  it('falls back to title when there is no src', () => {
    expect(carouselSlideContent({ title: 'A' }, 0)).toBe('A')
  })
})

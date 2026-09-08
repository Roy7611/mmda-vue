import { describe, expect, it } from 'vitest'
import {
  carouselBoundIndex,
  carouselEj2Effect,
  carouselSlideContent,
} from '../ui/factory/carousel'

describe('carousel contract helpers', () => {
  it('reads selectedIndex or modelValue', () => {
    expect(carouselBoundIndex({ items: [], selectedIndex: 2 })).toBe(2)
    expect(carouselBoundIndex({ items: [], modelValue: 3 })).toBe(3)
  })

  it('maps fade to EJ2 Fade', () => {
    expect(carouselEj2Effect('fade')).toBe('Fade')
    expect(carouselEj2Effect('slide')).toBe('Slide')
  })

  it('falls back to title when there is no src', () => {
    expect(carouselSlideContent({ title: 'A' }, 0)).toBe('A')
  })
})

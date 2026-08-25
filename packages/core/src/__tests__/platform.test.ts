import { describe, expect, it } from 'vitest'
import { Platform } from '../utils/platform'

describe('Platform（Node，无真实 UA）', () => {
  it('全部为 false', () => {
    expect(Platform.isMobile()).toBe(false)
    expect(Platform.isIOS()).toBe(false)
    expect(Platform.isAndroid()).toBe(false)
    expect(Platform.isPad()).toBe(false)
    expect(Platform.isWechat()).toBe(false)
    expect(Platform.isMiniprogram()).toBe(false)
  })
})

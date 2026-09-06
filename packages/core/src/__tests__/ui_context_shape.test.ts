import { describe, expect, it } from 'vitest'
import type { UiContext } from '../index'

type Forbidden = 'globalProps' | '$api'
type RequiredHost = 'apiClient' | 'app' | 'uiBuilder'

describe('UiContext shape', () => {
  it('Logic 可见接口不含 Vue 壳袋', () => {
    type Leak = Forbidden & keyof UiContext
    const leak: Leak extends never ? true : Leak = true
    expect(leak).toBe(true)
  })

  it('声明可移植宿主能力 apiClient / app / uiBuilder', () => {
    type Missing = Exclude<RequiredHost, keyof UiContext>
    const missing: Missing extends never ? true : Missing = true
    expect(missing).toBe(true)
  })
})

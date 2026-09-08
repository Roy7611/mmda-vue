import { describe, expect, it } from 'vitest'
import { resolveBarcodeCaption, resolveBarcodeDisplayText } from '../ui/factory/barcode'

describe('barcode caption', () => {
  it('resolves function displayText with the encoded value', () => {
    expect(resolveBarcodeDisplayText((data) => `SN-${data}`, '123')).toBe('SN-123')
  })

  it('prefers displayText over showValue', () => {
    const caption = resolveBarcodeCaption('abc', 'LABEL', false, true)
    expect(caption).toEqual({ text: 'LABEL', visible: true })
  })

  it('uses default showValue when displayText is omitted', () => {
    expect(resolveBarcodeCaption('abc', undefined, undefined, true).visible).toBe(
      true,
    )
    expect(resolveBarcodeCaption('abc', undefined, undefined, false).visible).toBe(
      false,
    )
  })
})

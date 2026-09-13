import { describe, expect, it } from 'vitest'
import {
  cssSizeOf,
  dialogShellStyleOf,
} from '../components/AgNaiveOverlayHost'

describe('dialogShellStyleOf', () => {
  it('maps maxHeight into NModal style (table settings 80vh)', () => {
    expect(
      dialogShellStyleOf({
        width: 'min(92vw, 30rem)',
        maxHeight: cssSizeOf('80vh'),
      }),
    ).toEqual({
      width: 'min(92vw, 30rem)',
      maxHeight: '80vh',
    })
  })

  it('normalizes numeric sizes to px', () => {
    expect(cssSizeOf(480)).toBe('480px')
    expect(
      dialogShellStyleOf({
        width: '40rem',
        height: cssSizeOf(600),
        minHeight: cssSizeOf(200),
        maxHeight: cssSizeOf(800),
      }),
    ).toEqual({
      width: '40rem',
      height: '600px',
      minHeight: '200px',
      maxHeight: '800px',
    })
  })

  it('omits empty optional sizes', () => {
    expect(cssSizeOf(undefined)).toBeUndefined()
    expect(cssSizeOf(null)).toBeUndefined()
    expect(dialogShellStyleOf({ width: '20rem' })).toEqual({ width: '20rem' })
  })
})

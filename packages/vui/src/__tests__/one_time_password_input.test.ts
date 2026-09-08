import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OTP_LENGTH,
  oneTimePasswordLengthOf,
  oneTimePasswordTypeOf,
  oneTimePasswordValueOf,
} from '../ui/factory/one_time_password_input'

describe('one time password chrome helpers', () => {
  it('defaults length 4 and type number', () => {
    expect(oneTimePasswordLengthOf({})).toBe(DEFAULT_OTP_LENGTH)
    expect(oneTimePasswordTypeOf({})).toBe('number')
  })

  it('reads value then modelValue', () => {
    expect(oneTimePasswordValueOf({ value: '1234' })).toBe('1234')
    expect(oneTimePasswordValueOf({ modelValue: 56 } as any)).toBe('56')
  })
})

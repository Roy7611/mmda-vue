import type { Translatable } from '../../metaui/metaui_field'
import type { FieldValidator } from './types'
import { asNumber, isAbsentValue } from './value'

const fail = (message: string, it?: string | number): Translatable => ({
  message,
  param: it == null ? undefined : { it },
})

const numeric =
  (
    name: string,
    check: (n: number) => Translatable | '',
  ): ((args: string[]) => FieldValidator) =>
  () => ({
    name,
    severity: 'error',
    validate: (value) => {
      const n = asNumber(value)
      if (n === undefined) return ''
      if (Number.isNaN(n)) return fail('invalid.number')
      return check(n)
    },
  })

const numericArg =
  (
    name: string,
    check: (n: number, arg: number) => Translatable | '',
  ): ((args: string[]) => FieldValidator) =>
  (args) => {
    const arg = Number(args[0])
    return {
      name,
      severity: 'error',
      validate: (value) => {
        const n = asNumber(value)
        if (n === undefined) return ''
        if (Number.isNaN(n) || !Number.isFinite(arg)) return fail('invalid.number')
        return check(n, arg)
      },
    }
  }

export const numberFactories: Record<string, (args: string[]) => FieldValidator> = {
  Min: numericArg('Min', (n, min) =>
    n < min ? fail('invalid.minValue', min) : '',
  ),
  Max: numericArg('Max', (n, max) =>
    n > max ? fail('invalid.maxValue', max) : '',
  ),
  Gt: numericArg('Gt', (n, bound) =>
    n <= bound ? fail('invalid.gt', bound) : '',
  ),
  Ge: numericArg('Ge', (n, bound) =>
    n < bound ? fail('invalid.ge', bound) : '',
  ),
  Lt: numericArg('Lt', (n, bound) =>
    n >= bound ? fail('invalid.lt', bound) : '',
  ),
  Le: numericArg('Le', (n, bound) =>
    n > bound ? fail('invalid.le', bound) : '',
  ),
  Positive: numeric('Positive', (n) => (n > 0 ? '' : fail('invalid.positive'))),
  PositiveOrZero: numeric('PositiveOrZero', (n) =>
    n >= 0 ? '' : fail('invalid.positiveOrZero'),
  ),
  Negative: numeric('Negative', (n) => (n < 0 ? '' : fail('invalid.negative'))),
  NegativeOrZero: numeric('NegativeOrZero', (n) =>
    n <= 0 ? '' : fail('invalid.negativeOrZero'),
  ),
  Range: (args) => {
    const min = Number(args[0])
    const max = Number(args[1])
    return {
      name: 'Range',
      severity: 'error',
      validate: (value) => {
        const n = asNumber(value)
        if (n === undefined) return ''
        if (Number.isNaN(n)) return fail('invalid.number')
        if (n < min || n > max) return fail('invalid.rangeValue', `${min} 到 ${max}`)
        return ''
      },
    }
  },
  Integer: numeric('Integer', (n) =>
    Number.isInteger(n) ? '' : fail('invalid.integer'),
  ),
  MultipleOf: numericArg('MultipleOf', (n, step) => {
    if (step === 0) return fail('invalid.multipleOf', step)
    const q = n / step
    if (Math.abs(q - Math.round(q)) > 1e-10) return fail('invalid.multipleOf', step)
    return ''
  }),
  Digits: (args) => ({
    name: 'Digits',
    severity: 'error',
    validate: (value) => {
      const n = asNumber(value)
      if (n === undefined) return ''
      if (Number.isNaN(n)) return fail('invalid.number')
      const integer = args.length >= 2 ? Number(args[0]) : undefined
      const fraction = args.length >= 2 ? Number(args[1]) : Number(args[0])
      const text = absDecimal(n)
      const [intPart, fracPart = ''] = text.split('.')
      const intDigits = intPart.replace(/^0+/, '') || '0'
      if (integer != null && intDigits.length > integer) {
        return fail('invalid.digits', `${integer},${fraction}`)
      }
      if (fracPart.length > fraction) return fail('invalid.digits', fraction)
      return ''
    },
  }),
}

function absDecimal(n: number): string {
  const s = String(Math.abs(n))
  if (!s.includes('e') && !s.includes('E')) return s
  return Math.abs(n).toFixed(16).replace(/\.?0+$/, '')
}

export const requiredValidate = (value: any, _model?: any) =>
  value === '' ||
  value === null ||
  value === undefined ||
  isAbsentValue(value)
    ? 'invalid.required'
    : ''

export const requiredNonZeroValidate = (val: any, model?: any) => {
  if (val === '0' || (+val) === 0) return 'invalid.required'
  return requiredValidate(val, model)
}

export const requiredAnyValidate = (value: any[]) =>
  value && value.length > 0 ? '' : 'invalid.requiredAny'

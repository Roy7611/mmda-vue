import { DateTime } from 'luxon'
import type { Translatable } from '../../metaui/metaui_field'
import type { FieldValidator } from './types'
import { isAbsentValue } from './value'

const fail = (message: string, it?: string): Translatable => ({
  message,
  param: it == null ? undefined : { it },
})

function toDateTime(value: unknown): DateTime | null {
  if (value instanceof DateTime) return value.isValid ? value : null
  if (value instanceof Date) {
    const dt = DateTime.fromJSDate(value)
    return dt.isValid ? dt : null
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const dt = DateTime.fromMillis(value)
    return dt.isValid ? dt : null
  }
  const s = String(value)
  const iso = DateTime.fromISO(s)
  if (iso.isValid) return iso
  const sql = DateTime.fromSQL(s)
  return sql.isValid ? sql : null
}

const relative =
  (
    name: string,
    check: (dt: DateTime, now: DateTime) => boolean,
    message: string,
  ): ((args: string[]) => FieldValidator) =>
  () => ({
    name,
    severity: 'error',
    validate: (value) => {
      if (isAbsentValue(value)) return ''
      const dt = toDateTime(value)
      if (!dt) return fail('invalid.date')
      return check(dt, DateTime.now()) ? '' : fail(message)
    },
  })

const bound =
  (
    name: string,
    inclusive: boolean,
    after: boolean,
    message: string,
  ): ((args: string[]) => FieldValidator) =>
  (args) => {
    const boundDt = toDateTime(args[0])
    return {
      name,
      severity: 'error',
      validate: (value) => {
        if (isAbsentValue(value)) return ''
        const dt = toDateTime(value)
        if (!dt || !boundDt) return fail('invalid.date')
        if (after) {
          const ok = inclusive ? dt >= boundDt : dt > boundDt
          return ok ? '' : fail(message, args[0])
        }
        const ok = inclusive ? dt <= boundDt : dt < boundDt
        return ok ? '' : fail(message, args[0])
      },
    }
  }

export const datetimeFactories: Record<string, (args: string[]) => FieldValidator> =
  {
    Past: relative('Past', (dt, now) => dt < now, 'invalid.past'),
    PastOrPresent: relative(
      'PastOrPresent',
      (dt, now) => dt <= now,
      'invalid.pastOrPresent',
    ),
    Future: relative('Future', (dt, now) => dt > now, 'invalid.future'),
    FutureOrPresent: relative(
      'FutureOrPresent',
      (dt, now) => dt >= now,
      'invalid.futureOrPresent',
    ),
    After: bound('After', false, true, 'invalid.after'),
    AfterOrEqual: bound('AfterOrEqual', true, true, 'invalid.afterOrEqual'),
    Before: bound('Before', false, false, 'invalid.before'),
    BeforeOrEqual: bound('BeforeOrEqual', true, false, 'invalid.beforeOrEqual'),
  }

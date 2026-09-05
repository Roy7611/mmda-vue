import type { Translatable } from '../../metaui/metaui_field'
import type { FieldValidator } from './types'
import { isAbsentValue } from './value'

const fail = (message: string, it?: string | number): Translatable => ({
  message,
  param: it == null ? undefined : { it },
})

function sizeOf(value: unknown): number | undefined {
  if (isAbsentValue(value)) return undefined
  if (Array.isArray(value) || typeof value === 'string') return value.length
  if (value instanceof Map || value instanceof Set) return value.size
  return undefined
}

export const collectionFactories: Record<
  string,
  (args: string[]) => FieldValidator
> = {
  NotEmpty: () => ({
    name: 'NotEmpty',
    severity: 'error',
    validate: (value) => {
      const n = sizeOf(value)
      if (n == null || n === 0) return fail('invalid.notEmpty')
      return ''
    },
  }),
  Size: (args) => {
    const min = args.length > 1 ? Number(args[0]) : 0
    const max = args.length > 1 ? Number(args[1]) : Number(args[0])
    return {
      name: 'Size',
      severity: 'error',
      validate: (value) => {
        const n = sizeOf(value)
        if (n === undefined) return ''
        if (n < min || n > max) return fail('invalid.size', `${min},${max}`)
        return ''
      },
    }
  },
}

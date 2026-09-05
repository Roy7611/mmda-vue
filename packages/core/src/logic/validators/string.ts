import type { Translatable } from '../../metaui/metaui_field'
import type { FieldValidator } from './types'
import { asString, isAbsentValue, unicodeLength } from './value'

const fail = (message: string, it?: string | number): Translatable => ({
  message,
  param: it == null ? undefined : { it },
})

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MOBILE = /^1[3-9]\d{9}$/
const PHONE = /^[+]?[\d\s\-()]{6,20}$/
const ID_CARD = /^\d{17}[\dXx]$/
const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const ID_CODES = '10X98765432'

function isIdCard(id: string): boolean {
  if (!ID_CARD.test(id)) return false
  let sum = 0
  for (let i = 0; i < 17; i++) sum += Number(id[i]) * ID_WEIGHTS[i]
  return ID_CODES[sum % 11] === id[17].toUpperCase()
}

function isUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function isUri(s: string): boolean {
  try {
    new URL(s)
    return true
  } catch {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:.+/.test(s)
  }
}

export const stringFactories: Record<string, (args: string[]) => FieldValidator> = {
  MaxLength: (args) => {
    const max = Number(args[0])
    return {
      name: 'MaxLength',
      severity: 'error',
      validate: (value) => {
        const s = asString(value)
        if (s === undefined) return ''
        return unicodeLength(s) > max ? fail('invalid.maxLength', max) : ''
      },
    }
  },
  MinLength: (args) => {
    const min = Number(args[0])
    return {
      name: 'MinLength',
      severity: 'error',
      validate: (value) => {
        const s = asString(value)
        if (s === undefined) return ''
        return unicodeLength(s) < min ? fail('invalid.minLength', min) : ''
      },
    }
  },
  Length: (args) => {
    const min = Number(args[0])
    const max = args.length > 1 ? Number(args[1]) : min
    return {
      name: 'Length',
      severity: 'error',
      validate: (value) => {
        const s = asString(value)
        if (s === undefined) return ''
        const len = unicodeLength(s)
        return len < min || len > max
          ? fail('invalid.length', `${min},${max}`)
          : ''
      },
    }
  },
  Ascii: (args) => {
    const max = args[0] != null && args[0] !== '' ? Number(args[0]) : undefined
    return {
      name: 'Ascii',
      severity: 'error',
      validate: (value) => {
        const s = asString(value)
        if (s === undefined) return ''
        if (/[^\x00-\x7F]/.test(s)) return fail('invalid.ascii')
        if (max != null && unicodeLength(s) > max) return fail('invalid.ascii', max)
        return ''
      },
    }
  },
  Unicode: (args) => {
    const max = args[0] != null && args[0] !== '' ? Number(args[0]) : undefined
    return {
      name: 'Unicode',
      severity: 'error',
      validate: (value) => {
        const s = asString(value)
        if (s === undefined) return ''
        if (max != null && unicodeLength(s) > max) return fail('invalid.unicode', max)
        return ''
      },
    }
  },
  Pattern: (args) => {
    let re: RegExp | null = null
    try {
      re = new RegExp(args[0] ?? '')
    } catch {
      console.warn(`Invalid Pattern regex: ${args[0]}`)
    }
    return {
      name: 'Pattern',
      severity: 'error',
      validate: (value) => {
        const s = asString(value)
        if (s === undefined) return ''
        if (!re || !re.test(s)) return fail('invalid.pattern')
        return ''
      },
    }
  },
  Email: () => ({
    name: 'Email',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return EMAIL.test(s) ? '' : fail('invalid.email')
    },
  }),
  Uri: () => ({
    name: 'Uri',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return isUri(s) ? '' : fail('invalid.uri')
    },
  }),
  Url: () => ({
    name: 'Url',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return isUrl(s) ? '' : fail('invalid.url')
    },
  }),
  Mobile: () => ({
    name: 'Mobile',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return MOBILE.test(s.trim()) ? '' : fail('invalid.mobile')
    },
  }),
  PhoneNumber: () => ({
    name: 'PhoneNumber',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return PHONE.test(s.trim()) ? '' : fail('invalid.phoneNumber')
    },
  }),
  NotBlank: () => ({
    name: 'NotBlank',
    severity: 'error',
    validate: (value) =>
      isAbsentValue(value) || (typeof value === 'string' && value.trim() === '')
        ? fail('invalid.notBlank')
        : '',
  }),
  Uuid: () => ({
    name: 'Uuid',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return UUID.test(s) ? '' : fail('invalid.uuid')
    },
  }),
  IdCard: () => ({
    name: 'IdCard',
    severity: 'error',
    validate: (value) => {
      const s = asString(value)
      if (s === undefined) return ''
      return isIdCard(s.trim()) ? '' : fail('invalid.idCard')
    },
  }),
}

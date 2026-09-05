import { isNullObject } from '../../utils/is'

/** 空值：除 Required / NotBlank / NotEmpty 外默认通过。 */
export function isAbsentValue(value: unknown): boolean {
  if (value === '' || value == null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (isNullObject(value) && !Array.isArray(value)) return true
  return false
}

export function asNumber(value: unknown): number | undefined {
  if (isAbsentValue(value)) return undefined
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : Number.NaN
}

export function asString(value: unknown): string | undefined {
  if (isAbsentValue(value)) return undefined
  return String(value)
}

export function unicodeLength(s: string): number {
  return Array.from(s).length
}

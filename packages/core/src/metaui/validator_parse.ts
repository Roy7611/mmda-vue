export interface ValidatorDescriptor {
  name: string
  args: string[]
}

/** 加载元数据时解析一次。`;` 仅在括号外、引号外切开。 */
export function parseValidatorDescriptors(
  validationRules?: string,
): ValidatorDescriptor[] {
  const src = (validationRules ?? '').trim()
  if (!src) return []

  const out: ValidatorDescriptor[] = []
  for (const raw of splitTopLevel(src, ';')) {
    const rule = raw.trim()
    if (!rule) continue
    const parsed = parseOneRule(rule)
    if (!parsed) {
      console.warn(`Invalid validation rule: ${rule}`)
      continue
    }
    out.push(parsed)
  }
  return out
}

function parseOneRule(rule: string): ValidatorDescriptor | null {
  let i = 0
  while (i < rule.length && rule.charCodeAt(i) <= 32) i++
  const start = i
  while (i < rule.length && isNameChar(rule.charCodeAt(i))) i++
  if (i === start) return null
  const name = rule.slice(start, i)
  while (i < rule.length && rule.charCodeAt(i) <= 32) i++
  if (i >= rule.length) return { name, args: [] }
  if (rule[i] !== '(') return null
  const close = findMatchingParen(rule, i)
  if (close < 0) return null
  let j = close + 1
  while (j < rule.length && rule.charCodeAt(j) <= 32) j++
  if (j < rule.length) return null
  return { name, args: splitArgs(rule.slice(i + 1, close)) }
}

function isNameChar(code: number) {
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57)
  )
}

function findMatchingParen(src: string, openIndex: number): number {
  let depth = 0
  let quote: '"' | "'" | null = null
  let escape = false
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i]
    if (quote) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function splitTopLevel(src: string, sep: string): string[] {
  const parts: string[] = []
  let buf = ''
  let depth = 0
  let quote: '"' | "'" | null = null
  let escape = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quote) {
      buf += ch
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      buf += ch
      continue
    }
    if (ch === '(') {
      depth++
      buf += ch
      continue
    }
    if (ch === ')') {
      if (depth > 0) depth--
      buf += ch
      continue
    }
    if (ch === sep && depth === 0) {
      parts.push(buf)
      buf = ''
      continue
    }
    buf += ch
  }
  parts.push(buf)
  return parts
}

function splitArgs(inner: string): string[] {
  if (!inner.trim()) return []
  return splitTopLevel(inner, ',').map(unquoteArg)
}

function unquoteArg(raw: string): string {
  const s = raw.trim()
  const q = s[0]
  if ((q === '"' || q === "'") && s.length >= 2 && s[s.length - 1] === q) {
    return decodeEscapes(s.slice(1, -1))
  }
  return s
}

function decodeEscapes(s: string): string {
  let out = ''
  let escape = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (escape) {
      out += ch
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    out += ch
  }
  return out
}

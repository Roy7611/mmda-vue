/**
 * ModuleAction.executableExpression：针对实体属性的简单布尔表达式。
 * 支持 ! && || == != > < >= <=、括号、true/false/null、数字、单/双引号字符串、属性名（可 a.b）。
 * 空表达式视为恒 true。解析失败返回恒 false。
 */
export function parseEntityBoolExpression(
  source?: string | null,
): (row: unknown, context?: any) => boolean {
  const text = source?.trim() ?? ''
  if (!text) return () => true
  try {
    const evalNode = compile(text)
    return (row: unknown) => Boolean(evalNode(asRecord(row)))
  } catch {
    return () => false
  }
}

const asRecord = (row: unknown): Record<string, unknown> =>
  row && typeof row === 'object' ? (row as Record<string, unknown>) : {}

type Eval = (row: Record<string, unknown>) => unknown

function compile(source: string): Eval {
  let i = 0
  const peek = () => source[i]
  const skip = () => {
    while (i < source.length && /\s/.test(source[i]!)) i += 1
  }
  const eat = (s: string) => {
    skip()
    if (source.slice(i, i + s.length) !== s) return false
    i += s.length
    return true
  }

  const parseOr = (): Eval => {
    let left = parseAnd()
    while (eat('||')) {
      const right = parseAnd()
      const l = left
      left = row => Boolean(l(row)) || Boolean(right(row))
    }
    return left
  }
  const parseAnd = (): Eval => {
    let left = parseNot()
    while (eat('&&')) {
      const right = parseNot()
      const l = left
      left = row => Boolean(l(row)) && Boolean(right(row))
    }
    return left
  }
  const parseNot = (): Eval => {
    if (eat('!')) {
      const inner = parseNot()
      return row => !inner(row)
    }
    return parseCompare()
  }
  const parseCompare = (): Eval => {
    const left = parsePrimary()
    skip()
    const op = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'].find(s =>
      source.startsWith(s, i),
    )
    if (!op) return left
    i += op.length
    const right = parsePrimary()
    const cmp = op === '===' || op === '==' ? '==' : op === '!==' || op === '!=' ? '!=' : op
    return row => compare(left(row), cmp, right(row))
  }
  const parsePrimary = (): Eval => {
    skip()
    if (eat('(')) {
      const inner = parseOr()
      skip()
      if (!eat(')')) throw new Error('expected )')
      return inner
    }
    if (source.startsWith("'", i) || source.startsWith('"', i)) {
      const value = readString()
      return () => value
    }
    if (/[-0-9.]/.test(peek() ?? '')) {
      const value = readNumber()
      return () => value
    }
    const ident = readIdent()
    if (ident === 'true') return () => true
    if (ident === 'false') return () => false
    if (ident === 'null') return () => null
    return row => readPath(row, ident)
  }

  const readIdent = (): string => {
    skip()
    const start = i
    if (!/[A-Za-z_]/.test(peek() ?? '')) throw new Error('expected ident')
    i += 1
    while (i < source.length && /[A-Za-z0-9_.]/.test(source[i]!)) i += 1
    return source.slice(start, i)
  }
  const readString = (): string => {
    const q = source[i]!
    i += 1
    let out = ''
    while (i < source.length && source[i] !== q) {
      if (source[i] === '\\' && i + 1 < source.length) {
        i += 1
        out += source[i]
        i += 1
        continue
      }
      out += source[i]
      i += 1
    }
    if (source[i] !== q) throw new Error('unterminated string')
    i += 1
    return out
  }
  const readNumber = (): number => {
    const start = i
    if (source[i] === '-') i += 1
    while (i < source.length && /[0-9.]/.test(source[i]!)) i += 1
    const n = Number(source.slice(start, i))
    if (!Number.isFinite(n)) throw new Error('bad number')
    return n
  }

  const fn = parseOr()
  skip()
  if (i < source.length) throw new Error('trailing input')
  return fn
}

function readPath(row: Record<string, unknown>, path: string): unknown {
  let cur: unknown = row
  for (const key of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

function compare(left: unknown, op: string, right: unknown): boolean {
  if (op === '==') return Object.is(left, right) || left == right
  if (op === '!=') return !(Object.is(left, right) || left == right)
  const a = Number(left)
  const b = Number(right)
  if (op === '>') return a > b
  if (op === '<') return a < b
  if (op === '>=') return a >= b
  if (op === '<=') return a <= b
  return false
}

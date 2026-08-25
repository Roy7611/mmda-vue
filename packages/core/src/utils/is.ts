export const isBrowser = typeof window !== 'undefined'

export const isNullOrUndefined = (val: unknown) =>
  val === undefined || val === null
export const isRefNone = (val: unknown) => !val || val === '0'
export const isEmpty = (items?: any[]) => !items || items.length == 0
export const isBoolean = (val: unknown): val is boolean =>
  typeof val === 'boolean'
export const isNumber = (val: unknown): val is number => typeof val === 'number'

export const isArray = Array.isArray
export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'

export const isDate = (val: unknown): val is Date =>
  toTypeString(val) === '[object Date]'
export const isRegExp = (val: unknown): val is RegExp =>
  toTypeString(val) === '[object RegExp]'
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isFile = (val: unknown): val is File =>
  typeof File !== 'undefined' && val instanceof File
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export const isObject = (val: unknown): val is Record<any, any> =>
  !!val && typeof val === 'object'
export const isNullObject = (val: unknown): val is Record<any, any> =>
  !!val && typeof val === 'object' && !Object.keys(val).length

export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

/** thenable（含带 then/catch 的函数）。普通 Promise 用 {@link isPromise} 即可。 */
export const isPromiseLike = <T = any>(val: unknown): val is Promise<T> => {
  if (isPromise<T>(val)) return true
  if (!isFunction(val)) return false
  const fn = val as Function & { then?: unknown; catch?: unknown }
  return isFunction(fn.then) && isFunction(fn.catch)
}

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string =>
  objectToString.call(value)
export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'

/**
 * 简易 UA 判断。无 window / navigator 时为 false。
 * 更完整的探测用 {@link Platform.isMobile}。
 */
export const isMobile = () => {
  if (!isBrowser || typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

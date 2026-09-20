/** 首字母转小写（纯函数，不修改全局 String.prototype）。 */
export function firstLetterLower(value: string): string {
  if (!value.length) return value
  return value[0].toLowerCase() + value.slice(1)
}

/** 首字母转大写（纯函数，不修改全局 String.prototype）。 */
export function firstLetterUpper(value: string): string {
  if (!value.length) return value
  return value[0].toUpperCase() + value.slice(1)
}

/** 数字字符串千分位格式化。 */
export function thousandDigitFormat(value: string): string {
  const parts = value.split('.')
  let integerPart = parts[0]
  const decimalPart = parts.length > 1 ? '.' + parts[1] : ''
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return integerPart + decimalPart
}

/** 单段词转 PascalCase（即首字母大写）。 */
export const toPascalCase = firstLetterUpper
